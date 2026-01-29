import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Brand } from '../taxonomy/entities/brand.entity';
import { VehicleModel } from '../taxonomy/entities/vehicle-model.entity';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ListVehiclesDto } from './dto/list-vehicles.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(VehicleModel)
    private readonly modelRepository: Repository<VehicleModel>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async listVehicles(filters: ListVehiclesDto, user: User): Promise<PaginatedResponse<any>> {
    const queryBuilder = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.store', 'store')
      .leftJoinAndSelect('vehicle.category', 'category')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .leftJoinAndSelect('vehicle.model', 'model')
      .leftJoinAndSelect('vehicle.photos', 'photos');

    // Filtro de hierarquia de lojas
    if (user.role === 'manager' && user.storeId) {
      const store = await this.storeRepository.findOne({
        where: { id: user.storeId },
        relations: ['children'],
      });

      const storeIds = [user.storeId];
      if (store.children) {
        storeIds.push(...store.children.map((c) => c.id));
      }
      // Se a loja tem parent, inclui também
      if (store.parentId) {
        storeIds.push(store.parentId);
      }

      queryBuilder.andWhere('vehicle.storeId IN (:...storeIds)', { storeIds });
    }

    // Filtros adicionais
    if (filters.search) {
      queryBuilder.andWhere(
        '(vehicle.plate ILIKE :search OR brand.name ILIKE :search OR model.name ILIKE :search OR vehicle.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.status) {
      queryBuilder.andWhere('vehicle.status = :status', { status: filters.status });
    }

    if (filters.category_id) {
      queryBuilder.andWhere('vehicle.categoryId = :categoryId', { categoryId: filters.category_id });
    }

    if (filters.store_id) {
      queryBuilder.andWhere('vehicle.storeId = :storeId', { storeId: filters.store_id });
    }

    if (filters.min_price !== undefined) {
      queryBuilder.andWhere('vehicle.price >= :minPrice', { minPrice: filters.min_price });
    }

    if (filters.max_price !== undefined) {
      queryBuilder.andWhere('vehicle.price <= :maxPrice', { maxPrice: filters.max_price });
    }

    // Ordenação
    const sortField = filters.sort || 'created_at';
    const orderDirection = (filters.order?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';

    const sortMap: Record<string, string> = {
      created_at: 'vehicle.createdAt',
      price: 'vehicle.price',
      model_year: 'vehicle.modelYear',
      mileage: 'vehicle.mileage',
    };

    queryBuilder.orderBy(sortMap[sortField], orderDirection);

    // Paginação
    const page = filters.page || 1;
    const pageSize = filters.page_size || 20;
    const skip = (page - 1) * pageSize;

    const [vehicles, total] = await queryBuilder.skip(skip).take(pageSize).getManyAndCount();

    return {
      data: vehicles,
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize),
      },
    };
  }

  async create(createVehicleDto: CreateVehicleDto, user: User): Promise<Vehicle> {
    // Validar placa única
    const existingPlate = await this.vehicleRepository.findOne({
      where: { plate: createVehicleDto.plate },
    });

    if (existingPlate) {
      throw new ConflictException('Placa já cadastrada');
    }

    // Validar permissão de loja (manager)
    if (user.role === 'manager' && user.storeId !== createVehicleDto.store_id) {
      const store = await this.storeRepository.findOne({
        where: { id: user.storeId },
      });

      if (!store || store.parentId !== createVehicleDto.store_id) {
        throw new ForbiddenException('Você não tem permissão para criar veículos nesta loja');
      }
    }

    // Auto-criação de Brand
    let brandId = createVehicleDto.brand_id;
    if (!brandId || brandId === 0) {
      // Verificar se já existe
      let brand = await this.brandRepository.findOne({
        where: { name: createVehicleDto.brand_name },
      });

      if (!brand) {
        brand = this.brandRepository.create({
          name: createVehicleDto.brand_name,
          brandFipeId: createVehicleDto.brand_fipe_id,
          logo: createVehicleDto.brand_logo,
        });
        brand = await this.brandRepository.save(brand);
      }

      brandId = brand.id;
    }

    // Auto-criação de Model
    let modelId = createVehicleDto.model_id;
    if (!modelId || modelId === 0) {
      // Verificar se já existe
      let model = await this.modelRepository.findOne({
        where: {
          brandId,
          name: createVehicleDto.model_name,
        },
      });

      if (!model) {
        model = this.modelRepository.create({
          brandId,
          name: createVehicleDto.model_name,
          modelFipeId: createVehicleDto.model_fipe_id,
        });
        model = await this.modelRepository.save(model);
      }

      modelId = model.id;
    }

    // Criar veículo
    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      brandId,
      modelId,
      storeId: createVehicleDto.store_id,
      categoryId: createVehicleDto.category_id,
    });

    return this.vehicleRepository.save(vehicle);
  }

  async findOne(id: number, user: User): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['store', 'category', 'brand', 'model', 'photos'],
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    // Validar permissão (manager)
    if (user.role === 'manager' && user.storeId) {
      const store = await this.storeRepository.findOne({
        where: { id: user.storeId },
      });

      const allowedStoreIds = [user.storeId];
      if (store.parentId) allowedStoreIds.push(store.parentId);

      if (!allowedStoreIds.includes(vehicle.storeId)) {
        throw new ForbiddenException('Você não tem permissão para acessar este veículo');
      }
    }

    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto, user: User): Promise<Vehicle> {
    const vehicle = await this.findOne(id, user);

    // Validar placa única (se mudou)
    if (updateVehicleDto.plate && updateVehicleDto.plate !== vehicle.plate) {
      const existingPlate = await this.vehicleRepository.findOne({
        where: { plate: updateVehicleDto.plate },
      });

      if (existingPlate) {
        throw new ConflictException('Placa já cadastrada');
      }
    }

    // Auto-criação de Brand (se necessário)
    if (updateVehicleDto.brand_name) {
      let brandId = updateVehicleDto.brand_id;
      if (!brandId || brandId === 0) {
        let brand = await this.brandRepository.findOne({
          where: { name: updateVehicleDto.brand_name },
        });

        if (!brand) {
          brand = this.brandRepository.create({
            name: updateVehicleDto.brand_name,
            brandFipeId: updateVehicleDto.brand_fipe_id,
            logo: updateVehicleDto.brand_logo,
          });
          brand = await this.brandRepository.save(brand);
        }

        brandId = brand.id;
      }

      updateVehicleDto.brand_id = brandId;
    }

    // Auto-criação de Model (se necessário)
    if (updateVehicleDto.model_name) {
      let modelId = updateVehicleDto.model_id;
      if (!modelId || modelId === 0) {
        let model = await this.modelRepository.findOne({
          where: {
            brandId: updateVehicleDto.brand_id || vehicle.brandId,
            name: updateVehicleDto.model_name,
          },
        });

        if (!model) {
          model = this.modelRepository.create({
            brandId: updateVehicleDto.brand_id || vehicle.brandId,
            name: updateVehicleDto.model_name,
            modelFipeId: updateVehicleDto.model_fipe_id,
          });
          model = await this.modelRepository.save(model);
        }

        modelId = model.id;
      }

      updateVehicleDto.model_id = modelId;
    }

    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async updateStatus(id: number, status: string, user: User): Promise<Vehicle> {
    const vehicle = await this.findOne(id, user);
    vehicle.status = status;
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: number, user: User): Promise<void> {
    const vehicle = await this.findOne(id, user);
    await this.vehicleRepository.softDelete(id);
  }
}
