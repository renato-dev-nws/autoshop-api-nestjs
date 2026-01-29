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
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 18, unique: true })
  cnpj: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Store;

  @OneToMany(() => Store, (store) => store.parent)
  children: Store[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.store)
  vehicles: Vehicle[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Helper method para obter IDs da hierarquia (loja + filiais)
  getHierarchyIds(): number[] {
    const ids = [this.id];
    if (this.parentId) ids.push(this.parentId);
    return ids;
  }
}
