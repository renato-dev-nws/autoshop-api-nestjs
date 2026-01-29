import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { typeOrmConfig } from './config/typeorm.config';
import { redisConfig } from './config/redis.config';
import { AuthModule } from './auth/auth.module';
import { PublicModule } from './public/public.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { PhotosModule } from './photos/photos.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';
import { FipeModule } from './fipe/fipe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: redisConfig,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requisições
      },
    ]),
    AuthModule,
    PublicModule,
    VehiclesModule,
    PhotosModule,
    TaxonomyModule,
    StoresModule,
    UsersModule,
    FipeModule,
  ],
})
export class AppModule {}
