import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxonomyController } from './taxonomy.controller';
import { TaxonomyService } from './taxonomy.service';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Brand, VehicleModel, Vehicle])],
  controllers: [TaxonomyController],
  providers: [TaxonomyService],
  exports: [TaxonomyService, TypeOrmModule],
})
export class TaxonomyModule {}
