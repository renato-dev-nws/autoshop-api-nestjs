import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Store } from '../stores/entities/store.entity';
import { Category } from '../taxonomy/entities/category.entity';
import { Brand } from '../taxonomy/entities/brand.entity';
import { VehicleModel } from '../taxonomy/entities/vehicle-model.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehiclePhoto } from '../photos/entities/vehicle-photo.entity';
import { User } from '../users/entities/user.entity';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'vehicles_shop',
  entities: [Store, Category, Brand, VehicleModel, Vehicle, VehiclePhoto, User],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsRun: true,
});
