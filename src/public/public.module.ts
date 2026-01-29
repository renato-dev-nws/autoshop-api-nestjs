import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Category } from '../taxonomy/entities/category.entity';
import { Brand } from '../taxonomy/entities/brand.entity';
import { Store } from '../stores/entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Category, Brand, Store])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
