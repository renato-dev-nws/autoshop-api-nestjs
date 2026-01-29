import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Category } from '../taxonomy/entities/category.entity';
import { Brand } from '../taxonomy/entities/brand.entity';
import { Store } from '../stores/entities/store.entity';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async searchVehicles(filters: SearchVehiclesDto): Promise<PaginatedResponse<any>> {
    const queryBuilder = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.store', 'store')
      .leftJoinAndSelect('vehicle.category', 'category')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .leftJoinAndSelect('vehicle.model', 'model')
      .leftJoinAndSelect('vehicle.photos', 'photos')
      .where('vehicle.status = :status', { status: 'Available' });

    // Filtros
    if (filters.category_id) {
      queryBuilder.andWhere('vehicle.categoryId = :categoryId', { categoryId: filters.category_id });
    }

    if (filters.brand_fipe_id) {
      queryBuilder.andWhere('brand.brandFipeId = :brandFipeId', { brandFipeId: filters.brand_fipe_id });
    }

    if (filters.model_fipe_id) {
      queryBuilder.andWhere('model.modelFipeId = :modelFipeId', { modelFipeId: filters.model_fipe_id });
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

    if (filters.year_min) {
      queryBuilder.andWhere('vehicle.modelYear >= :yearMin', { yearMin: filters.year_min });
    }

    if (filters.year_max) {
      queryBuilder.andWhere('vehicle.modelYear <= :yearMax', { yearMax: filters.year_max });
    }

    if (filters.home_highlight) {
      queryBuilder.andWhere('vehicle.homeHighlight = :homeHighlight', { homeHighlight: true });
    }

    if (filters.brand_highlight) {
      queryBuilder.andWhere('vehicle.brandHighlight = :brandHighlight', { brandHighlight: true });
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

    // Formatar resposta
    const data = vehicles.map((vehicle) => ({
      id: vehicle.id,
      plate: vehicle.plate,
      brand_name: vehicle.brand?.name,
      brand_fipe_id: vehicle.brand?.brandFipeId,
      model_name: vehicle.model?.name,
      model_fipe_id: vehicle.model?.modelFipeId,
      model_year: vehicle.modelYear,
      manufacture_year: vehicle.manufactureYear,
      price: vehicle.price,
      mileage: vehicle.mileage,
      color: vehicle.color,
      fuel_type: vehicle.fuelType,
      status: vehicle.status,
      cover_photo_url: vehicle.photos?.find((p) => p.isCover)?.url || vehicle.photos?.[0]?.url,
      store_name: vehicle.store?.name,
      category_name: vehicle.category?.name,
      home_highlight: vehicle.homeHighlight,
      brand_highlight: vehicle.brandHighlight,
    }));

    return {
      data,
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize),
      },
    };
  }

  async getVehicleById(id: number) {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id, status: 'Available' },
      relations: ['store', 'category', 'brand', 'model', 'photos'],
    });

    if (!vehicle) {
      return null;
    }

    return {
      id: vehicle.id,
      plate: vehicle.plate,
      brand_fipe_id: vehicle.brand?.brandFipeId,
      model_fipe_id: vehicle.model?.modelFipeId,
      model_year: vehicle.modelYear,
      manufacture_year: vehicle.manufactureYear,
      mileage: vehicle.mileage,
      color: vehicle.color,
      fuel_type: vehicle.fuelType,
      price: vehicle.price,
      fipe_code: vehicle.fipeCode,
      fipe_value: vehicle.fipeValue,
      description: vehicle.description,
      status: vehicle.status,
      home_highlight: vehicle.homeHighlight,
      brand_highlight: vehicle.brandHighlight,
      features: vehicle.features,
      specifications: vehicle.specifications,
      category: {
        id: vehicle.category?.id,
        name: vehicle.category?.name,
        icon: vehicle.category?.icon,
      },
      store: {
        id: vehicle.store?.id,
        name: vehicle.store?.name,
        cnpj: vehicle.store?.cnpj,
        address: vehicle.store?.address,
        phone: vehicle.store?.phone,
      },
      brand: {
        id: vehicle.brand?.id,
        name: vehicle.brand?.name,
        logo: vehicle.brand?.logo,
        brand_fipe_id: vehicle.brand?.brandFipeId,
      },
      model: {
        id: vehicle.model?.id,
        name: vehicle.model?.name,
        model_fipe_id: vehicle.model?.modelFipeId,
      },
      photos: vehicle.photos
        ?.sort((a, b) => a.displayOrder - b.displayOrder)
        .map((photo) => ({
          id: photo.id,
          url: photo.url,
          is_cover: photo.isCover,
          display_order: photo.displayOrder,
        })),
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt,
    };
  }

  async getCategories() {
    const categories = await this.categoryRepository.find({
      where: { active: true },
      order: { name: 'ASC' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      active: cat.active,
    }));
  }

  async getBrands() {
    const brands = await this.brandRepository.find({
      order: { name: 'ASC' },
    });

    return brands.map((brand) => ({
      id: brand.id,
      brand_fipe_id: brand.brandFipeId,
      name: brand.name,
      logo: brand.logo,
    }));
  }

  async getModels() {
    // Retorna modelos DISTINCT baseado nos veículos disponíveis
    const models = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .select('DISTINCT model.modelFipeId', 'model_fipe_id')
      .addSelect('model.name', 'model_name')
      .addSelect('brand.brandFipeId', 'brand_fipe_id')
      .addSelect('brand.name', 'brand_name')
      .addSelect('brand.logo', 'brand_logo')
      .leftJoin('vehicle.model', 'model')
      .leftJoin('vehicle.brand', 'brand')
      .where('vehicle.status = :status', { status: 'Available' })
      .orderBy('brand.name', 'ASC')
      .addOrderBy('model.name', 'ASC')
      .getRawMany();

    return models;
  }

  async getStores() {
    const stores = await this.storeRepository.find({
      order: { name: 'ASC' },
      relations: ['parent'],
    });

    return stores.map((store) => ({
      id: store.id,
      name: store.name,
      cnpj: store.cnpj,
      address: store.address,
      phone: store.phone,
      parent_id: store.parentId,
      parent: store.parent ? { id: store.parent.id, name: store.parent.name } : null,
    }));
  }
}
