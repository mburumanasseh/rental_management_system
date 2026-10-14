import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Lease } from '../../leases/entities/lease.entity.js';
import { InvoiceLineItem } from './invoice-line-item.entity.js';

export enum InvoiceStatus {
  PENDING = 'pending',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum InvoiceType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  UTILITY = 'utility',
  PENALTY = 'penalty',
  OTHER = 'other',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  invoiceNumber: string;

  @Index()
  @Column({ type: 'uuid' })
  leaseId: string;

  @ManyToOne(() => Lease, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'leaseId' })
  lease: Lease;

  @Column({
    type: 'enum',
    enum: InvoiceType,
    default: InvoiceType.RENT,
  })
  type: InvoiceType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'date', nullable: true })
  periodStart: string | null;

  @Column({ type: 'date', nullable: true })
  periodEnd: string | null;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => InvoiceLineItem, (item) => item.invoice, {
    cascade: true,
    eager: true,
  })
  lineItems: InvoiceLineItem[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
