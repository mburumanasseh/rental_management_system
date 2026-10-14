import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity.js';
import {
  Invoice,
  InvoiceStatus,
} from '../invoices/entities/invoice.entity.js';
import { InitiateStkPushDto } from './dto/initiate-stk-push.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { MpesaService } from './mpesa/mpesa.service.js';
import { MpesaStkCallbackDto, MpesaC2BCallbackDto } from './dto/mpesa-callback.dto.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private readonly invoicesRepository: Repository<Invoice>,
    private readonly mpesaService: MpesaService,
  ) {}

  async initiateStkPush(dto: InitiateStkPushDto): Promise<{
    payment: Payment;
    mpesaResponse: any;
  }> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id: dto.invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${dto.invoiceId} not found`);
    }
    if (
      invoice.status === InvoiceStatus.PAID ||
      invoice.status === InvoiceStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot pay an invoice with status ${invoice.status}`,
      );
    }

    const remaining =
      Number(invoice.amount) - Number(invoice.amountPaid);
    const amount = dto.amount ?? remaining;
    if (amount <= 0) {
      throw new BadRequestException('Nothing left to pay on this invoice');
    }
    if (amount > remaining) {
      throw new BadRequestException(
        `Amount exceeds remaining balance of ${remaining}`,
      );
    }

    const payment = this.paymentsRepository.create({
      invoiceId: invoice.id,
      amount,
      method: PaymentMethod.MPESA,
      status: PaymentStatus.PENDING,
      phoneNumber: dto.phoneNumber,
    });
    const savedPayment = await this.paymentsRepository.save(payment);

    try {
      const mpesaResponse = await this.mpesaService.initiateStkPush({
        phoneNumber: dto.phoneNumber,
        amount,
        accountReference: invoice.invoiceNumber,
        transactionDesc: `Rent ${invoice.invoiceNumber}`,
      });

      // Store CheckoutRequestID as transactionId for later matching
      savedPayment.transactionId = mpesaResponse.CheckoutRequestID;
      savedPayment.status = PaymentStatus.PROCESSING;
      await this.paymentsRepository.save(savedPayment);

      return { payment: savedPayment, mpesaResponse };
    } catch (err) {
      savedPayment.status = PaymentStatus.FAILED;
      savedPayment.failureReason =
        err instanceof Error ? err.message : 'STK Push failed';
      await this.paymentsRepository.save(savedPayment);
      throw err;
    }
  }

  async handleStkCallback(payload: MpesaStkCallbackDto): Promise<void> {
    const cb = payload?.Body?.stkCallback;
    if (!cb) {
      this.logger.warn('Invalid STK callback payload');
      return;
    }

    const payment = await this.paymentsRepository.findOne({
      where: { transactionId: cb.CheckoutRequestID },
    });
    if (!payment) {
      this.logger.warn(
        `No payment found for CheckoutRequestID ${cb.CheckoutRequestID}`,
      );
      return;
    }

    payment.rawPayload = payload as any;

    if (cb.ResultCode === 0) {
      // Success
      const meta = cb.CallbackMetadata?.Item || [];
      const get = (name: string) =>
        meta.find((i) => i.Name === name)?.Value;

      payment.status = PaymentStatus.COMPLETED;
      payment.mpesaReceiptNumber = String(get('MpesaReceiptNumber') || '');
      payment.paidAt = new Date();
      payment.amount = Number(get('Amount') || payment.amount);

      await this.paymentsRepository.save(payment);
      await this.reconcilePayment(payment);
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = cb.ResultDesc;
      await this.paymentsRepository.save(payment);
    }
  }

  async handleC2BCallback(payload: MpesaC2BCallbackDto): Promise<void> {
    // Create a payment from C2B and try to match invoice via BillRefNumber
    const existing = await this.paymentsRepository.findOne({
      where: { transactionId: payload.TransID },
    });
    if (existing) return; // idempotent

    const amount = Number(payload.TransAmount);
    let invoiceId: string | null = null;

    // Try to match by invoice number in BillRefNumber
    if (payload.BillRefNumber) {
      const invoice = await this.invoicesRepository.findOne({
        where: { invoiceNumber: payload.BillRefNumber },
      });
      if (invoice) invoiceId = invoice.id;
    }

    const payment = this.paymentsRepository.create({
      invoiceId,
      amount,
      method: PaymentMethod.PAYBILL,
      status: PaymentStatus.COMPLETED,
      transactionId: payload.TransID,
      mpesaReceiptNumber: payload.TransID,
      phoneNumber: payload.MSISDN,
      rawPayload: payload as any,
      paidAt: new Date(),
    });

    const saved = await this.paymentsRepository.save(payment);
    if (invoiceId) {
      await this.reconcilePayment(saved);
    }
  }

  async reconcilePayment(payment: Payment): Promise<void> {
    if (!payment.invoiceId || payment.status !== PaymentStatus.COMPLETED) {
      return;
    }

    const invoice = await this.invoicesRepository.findOne({
      where: { id: payment.invoiceId },
    });
    if (!invoice) return;

    const newPaid = Number(invoice.amountPaid) + Number(payment.amount);
    invoice.amountPaid = newPaid;

    if (newPaid >= Number(invoice.amount)) {
      invoice.status = InvoiceStatus.PAID;
    } else if (newPaid > 0) {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await this.invoicesRepository.save(invoice);

    payment.reconciledAt = new Date();
    await this.paymentsRepository.save(payment);

    this.logger.log(
      `Reconciled payment ${payment.id} → invoice ${invoice.invoiceNumber} (${invoice.status})`,
    );
  }

  async createManual(dto: CreatePaymentDto): Promise<Payment> {
    if (dto.invoiceId) {
      const invoice = await this.invoicesRepository.findOne({
        where: { id: dto.invoiceId },
      });
      if (!invoice) {
        throw new NotFoundException(`Invoice ${dto.invoiceId} not found`);
      }
    }

    const payment = this.paymentsRepository.create({
      invoiceId: dto.invoiceId ?? null,
      amount: dto.amount,
      method: dto.method,
      status: PaymentStatus.COMPLETED,
      transactionId: dto.transactionId ?? null,
      phoneNumber: dto.phoneNumber ?? null,
      paidAt: new Date(),
    });

    const saved = await this.paymentsRepository.save(payment);
    if (dto.invoiceId) {
      await this.reconcilePayment(saved);
    }
    return saved;
  }

  async findAll(filters?: {
    invoiceId?: string;
    status?: PaymentStatus;
  }): Promise<Payment[]> {
    const qb = this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .orderBy('payment.createdAt', 'DESC');

    if (filters?.invoiceId) {
      qb.andWhere('payment.invoiceId = :invoiceId', {
        invoiceId: filters.invoiceId,
      });
    }
    if (filters?.status) {
      qb.andWhere('payment.status = :status', { status: filters.status });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['invoice'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }
    return payment;
  }
}
