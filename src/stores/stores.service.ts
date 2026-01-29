import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find({
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!store) {
      throw new NotFoundException('Loja não encontrada');
    }

    return store;
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    // Validar CNPJ único
    const existingCnpj = await this.storeRepository.findOne({
      where: { cnpj: createStoreDto.cnpj },
    });

    if (existingCnpj) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    // Validar parent_id se fornecido
    if (createStoreDto.parent_id) {
      const parent = await this.storeRepository.findOne({
        where: { id: createStoreDto.parent_id },
      });

      if (!parent) {
        throw new NotFoundException('Loja matriz não encontrada');
      }

      // Não permitir filial de filial (máximo 2 níveis)
      if (parent.parentId) {
        throw new BadRequestException(
          'Não é possível criar filial de uma filial. Apenas 2 níveis de hierarquia são permitidos',
        );
      }
    }

    const store = this.storeRepository.create({
      name: createStoreDto.name,
      cnpj: createStoreDto.cnpj,
      address: createStoreDto.address,
      phone: createStoreDto.phone,
      parentId: createStoreDto.parent_id,
    });

    return this.storeRepository.save(store);
  }

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);

    // Validar CNPJ único (se mudou)
    if (updateStoreDto.cnpj && updateStoreDto.cnpj !== store.cnpj) {
      const existingCnpj = await this.storeRepository.findOne({
        where: { cnpj: updateStoreDto.cnpj },
      });

      if (existingCnpj) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    // Validar parent_id se mudou
    if (updateStoreDto.parent_id !== undefined && updateStoreDto.parent_id !== store.parentId) {
      if (updateStoreDto.parent_id) {
        const parent = await this.storeRepository.findOne({
          where: { id: updateStoreDto.parent_id },
        });

        if (!parent) {
          throw new NotFoundException('Loja matriz não encontrada');
        }

        // Não permitir filial de filial
        if (parent.parentId) {
          throw new BadRequestException('Não é possível criar filial de uma filial');
        }

        // Não permitir que matriz vire filial se tiver filiais
        if (store.children && store.children.length > 0) {
          throw new BadRequestException(
            'Não é possível tornar matriz em filial pois ela possui filiais',
          );
        }
      }
    }

    Object.assign(store, updateStoreDto);
    if (updateStoreDto.parent_id !== undefined) {
      store.parentId = updateStoreDto.parent_id;
    }

    return this.storeRepository.save(store);
  }

  async remove(id: number): Promise<void> {
    const store = await this.findOne(id);

    // Verificar se há veículos usando esta loja
    const vehicleCount = await this.vehicleRepository.count({
      where: { storeId: id },
    });

    if (vehicleCount > 0) {
      throw new ConflictException(
        `Não é possível deletar. Existem ${vehicleCount} veículos cadastrados nesta loja`,
      );
    }

    // Verificar se há filiais
    if (store.children && store.children.length > 0) {
      throw new ConflictException(
        `Não é possível deletar. Esta loja possui ${store.children.length} filiais`,
      );
    }

    await this.storeRepository.softDelete(id);
  }
}
