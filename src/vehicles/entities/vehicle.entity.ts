import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { Category } from '../../taxonomy/entities/category.entity';
import { Brand } from '../../taxonomy/entities/brand.entity';
import { VehicleModel } from '../../taxonomy/entities/vehicle-model.entity';
import { VehiclePhoto } from '../../photos/entities/vehicle-photo.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store, (store) => store.vehicles)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.vehicles)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'brand_id' })
  brandId: number;

  @ManyToOne(() => Brand, (brand) => brand.vehicles)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ name: 'model_id' })
  modelId: number;

  @ManyToOne(() => VehicleModel, (model) => model.vehicles)
  @JoinColumn({ name: 'model_id' })
  model: VehicleModel;

  @Column({ length: 10, unique: true })
  plate: string;

  @Column({ name: 'manufacture_year' })
  manufactureYear: number;

  @Column({ name: 'model_year' })
  modelYear: number;

  @Column({ default: 0 })
  mileage: number;

  @Column({ length: 50, nullable: true })
  color: string;

  @Column({ name: 'fuel_type', length: 50, nullable: true })
  fuelType: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ name: 'fipe_code', length: 20, nullable: true })
  fipeCode: string;

  @Column({ name: 'fipe_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  fipeValue: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['Available', 'Reserved', 'Sold'],
    default: 'Available',
  })
  status: string;

  @Column({ name: 'home_highlight', default: false })
  homeHighlight: boolean;

  @Column({ name: 'brand_highlight', default: false })
  brandHighlight: boolean;

  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  @OneToMany(() => VehiclePhoto, (photo) => photo.vehicle, { cascade: true })
  photos: VehiclePhoto[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
