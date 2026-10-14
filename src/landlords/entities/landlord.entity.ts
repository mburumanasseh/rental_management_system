import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Property } from '../../properties/entities/property.entity.js';

@Entity('landlords')
export class Landlord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  kraPin: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bankAccountNumber: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bankAccountName: string | null;

  @OneToMany(() => Property, (property) => property.landlord)
  properties: Property[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
