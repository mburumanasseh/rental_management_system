import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from './entities/receipt.entity.js';
import { CreateReceiptDto } from './dto/create-receipt.dto.js';
import {
  Payment,
  PaymentStatus,
} from '../payments/entities/payment.entity.js';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptsRepository: Repository<Receipt>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  private async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.receiptsRepository.count();
    const seq = String(count + 1).padStart(6, '0');
    return `RCP-${year}-${seq}`;
  }

  async create(dto: CreateReceiptDto): Promise<Receipt> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: dto.paymentId },
      relations: ['invoice'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment ${dto.paymentId} not found`);
    }
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Receipts can only be issued for completed payments',
      );
    }

    const existing = await this.receiptsRepository.findOne({
      where: { paymentId: dto.paymentId },
    });
    if (existing) {
      throw new ConflictException(
        'A receipt has already been issued for this payment',
      );
    }

    const receiptNumber = await this.generateReceiptNumber();

    const receipt = this.receiptsRepository.create({
      receiptNumber,
      paymentId: payment.id,
      amount: payment.amount,
      issuedTo: dto.issuedTo ?? null,
      description:
        dto.description ??
        `Payment receipt for ${payment.mpesaReceiptNumber || payment.transactionId || payment.id}`,
      issuedAt: new Date(),
    });

    return this.receiptsRepository.save(receipt);
  }

  /** Automatically issue a receipt after a successful payment (called from payments flow if desired) */
  async issueForPayment(paymentId: string): Promise<Receipt | null> {
    try {
      return await this.create({ paymentId });
    } catch {
      return null; // already exists or payment not completed
    }
  }

  async findAll(filters?: { paymentId?: string }): Promise<Receipt[]> {
    const qb = this.receiptsRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.payment', 'payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .orderBy('receipt.issuedAt', 'DESC');

    if (filters?.paymentId) {
      qb.andWhere('receipt.paymentId = :paymentId', {
        paymentId: filters.paymentId,
      });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<Receipt> {
    const receipt = await this.receiptsRepository.findOne({
      where: { id },
      relations: ['payment', 'payment.invoice'],
    });
    if (!receipt) {
      throw new NotFoundException(`Receipt ${id} not found`);
    }
    return receipt;
  }

  async findByReceiptNumber(receiptNumber: string): Promise<Receipt> {
    const receipt = await this.receiptsRepository.findOne({
      where: { receiptNumber },
      relations: ['payment', 'payment.invoice'],
    });
    if (!receipt) {
      throw new NotFoundException(`Receipt ${receiptNumber} not found`);
    }
    return receipt;
  }
}
