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
import { Invoice } from '../../invoices/entities/invoice.entity.js';

export enum PaymentMethod {
  MPESA = 'mpesa',
  BANK = 'bank',
  PAYBILL = 'paybill',
  CASH = 'cash',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  invoiceId: string | null;

  @ManyToOne(() => Invoice, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.MPESA,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mpesaReceiptNumber: string | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  reconciledAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
