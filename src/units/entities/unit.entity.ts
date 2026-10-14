import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity.js';

export enum UnitStatus {
  VACANT = 'vacant',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
}

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Property, (property) => property.units, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'varchar', length: 50 })
  unitNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  rentAmount: number;

  @Column({
    type: 'enum',
    enum: UnitStatus,
    default: UnitStatus.VACANT,
  })
  status: UnitStatus;

  @Column({ type: 'int', nullable: true })
  bedrooms: number | null;

  @Column({ type: 'int', nullable: true })
  bathrooms: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sizeSqm: number | null;

  @Column({ type: 'text', nullable: true })
  amenities: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
