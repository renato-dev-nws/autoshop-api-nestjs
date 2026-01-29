import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Injectable()
export class TaxonomyService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(VehicleModel)
    private readonly modelRepository: Repository<VehicleModel>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  // ==================== CATEGORIES ====================

  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async findOneCategory(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return category;
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException('Categoria com este nome já existe');
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOneCategory(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existing) {
        throw new ConflictException('Categoria com este nome já existe');
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async removeCategory(id: number): Promise<void> {
    const category = await this.findOneCategory(id);

    // Verificar se há veículos usando esta categoria
    const vehicleCount = await this.vehicleRepository.count({
      where: { categoryId: id },
    });

    if (vehicleCount > 0) {
      throw new ConflictException(
        `Não é possível deletar. Existem ${vehicleCount} veículos usando esta categoria`,
      );
    }

    await this.categoryRepository.softDelete(id);
  }

  // ==================== BRANDS ====================

  async findAllBrands(): Promise<Brand[]> {
    return this.brandRepository.find({ order: { name: 'ASC' } });
  }

  async findOneBrand(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Marca não encontrada');
    }
    return brand;
  }

  async createBrand(createBrandDto: CreateBrandDto): Promise<Brand> {
    const existing = await this.brandRepository.findOne({
      where: { name: createBrandDto.name },
    });

    if (existing) {
      throw new ConflictException('Marca com este nome já existe');
    }

    const brand = this.brandRepository.create({
      name: createBrandDto.name,
      brandFipeId: createBrandDto.brand_fipe_id,
      logo: createBrandDto.logo,
    });
    return this.brandRepository.save(brand);
  }

  async updateBrand(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOneBrand(id);

    if (updateBrandDto.name && updateBrandDto.name !== brand.name) {
      const existing = await this.brandRepository.findOne({
        where: { name: updateBrandDto.name },
      });

      if (existing) {
        throw new ConflictException('Marca com este nome já existe');
      }
    }

    if (updateBrandDto.brand_fipe_id !== undefined) {
      brand.brandFipeId = updateBrandDto.brand_fipe_id;
    }
    if (updateBrandDto.name) {
      brand.name = updateBrandDto.name;
    }
    if (updateBrandDto.logo !== undefined) {
      brand.logo = updateBrandDto.logo;
    }

    return this.brandRepository.save(brand);
  }

  async removeBrand(id: number): Promise<void> {
    const brand = await this.findOneBrand(id);

    // Verificar se há veículos usando esta marca
    const vehicleCount = await this.vehicleRepository.count({
      where: { brandId: id },
    });

    if (vehicleCount > 0) {
      throw new ConflictException(
        `Não é possível deletar. Existem ${vehicleCount} veículos usando esta marca`,
      );
    }

    await this.brandRepository.softDelete(id);
  }

  // ==================== MODELS ====================

  async findAllModels(): Promise<VehicleModel[]> {
    return this.modelRepository.find({
      relations: ['brand'],
      order: { name: 'ASC' },
    });
  }

  async findOneModel(id: number): Promise<VehicleModel> {
    const model = await this.modelRepository.findOne({
      where: { id },
      relations: ['brand'],
    });

    if (!model) {
      throw new NotFoundException('Modelo não encontrado');
    }
    return model;
  }

  async createModel(createModelDto: CreateModelDto): Promise<VehicleModel> {
    // Verificar se a marca existe
    const brand = await this.brandRepository.findOne({
      where: { id: createModelDto.brand_id },
    });

    if (!brand) {
      throw new NotFoundException('Marca não encontrada');
    }

    // Verificar se já existe modelo com este nome para esta marca
    const existing = await this.modelRepository.findOne({
      where: {
        brandId: createModelDto.brand_id,
        name: createModelDto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Modelo com este nome já existe para esta marca');
    }

    const model = this.modelRepository.create({
      brandId: createModelDto.brand_id,
      name: createModelDto.name,
      modelFipeId: createModelDto.model_fipe_id,
    });

    return this.modelRepository.save(model);
  }

  async updateModel(id: number, updateModelDto: UpdateModelDto): Promise<VehicleModel> {
    const model = await this.findOneModel(id);

    if (updateModelDto.brand_id && updateModelDto.brand_id !== model.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: updateModelDto.brand_id },
      });

      if (!brand) {
        throw new NotFoundException('Marca não encontrada');
      }

      model.brandId = updateModelDto.brand_id;
    }

    if (updateModelDto.name && updateModelDto.name !== model.name) {
      const existing = await this.modelRepository.findOne({
        where: {
          brandId: model.brandId,
          name: updateModelDto.name,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Modelo com este nome já existe para esta marca');
      }

      model.name = updateModelDto.name;
    }

    if (updateModelDto.model_fipe_id !== undefined) {
      model.modelFipeId = updateModelDto.model_fipe_id;
    }

    return this.modelRepository.save(model);
  }

  async removeModel(id: number): Promise<void> {
    const model = await this.findOneModel(id);

    // Verificar se há veículos usando este modelo
    const vehicleCount = await this.vehicleRepository.count({
      where: { modelId: id },
    });

    if (vehicleCount > 0) {
      throw new ConflictException(
        `Não é possível deletar. Existem ${vehicleCount} veículos usando este modelo`,
      );
    }

    await this.modelRepository.softDelete(id);
  }
}
