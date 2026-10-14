import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Invoice,
  InvoiceStatus,
  InvoiceType,
} from './entities/invoice.entity.js';
import { InvoiceLineItem } from './entities/invoice-line-item.entity.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceDto } from './dto/update-invoice.dto.js';
import { GenerateRentInvoicesDto } from './dto/generate-rent-invoices.dto.js';
import { Lease, LeaseStatus } from '../leases/entities/lease.entity.js';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceLineItem)
    private readonly lineItemsRepository: Repository<InvoiceLineItem>,
    @InjectRepository(Lease)
    private readonly leasesRepository: Repository<Lease>,
  ) {}

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.invoicesRepository.count();
    const seq = String(count + 1).padStart(6, '0');
    return `INV-${year}-${seq}`;
  }

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    const lease = await this.leasesRepository.findOne({
      where: { id: dto.leaseId },
    });
    if (!lease) {
      throw new NotFoundException(`Lease ${dto.leaseId} not found`);
    }

    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = this.invoicesRepository.create({
      invoiceNumber,
      leaseId: dto.leaseId,
      type: dto.type ?? InvoiceType.RENT,
      amount: dto.amount,
      dueDate: dto.dueDate,
      periodStart: dto.periodStart ?? null,
      periodEnd: dto.periodEnd ?? null,
      description: dto.description ?? null,
      notes: dto.notes ?? null,
      status: InvoiceStatus.PENDING,
      amountPaid: 0,
    });

    const saved = await this.invoicesRepository.save(invoice);

    if (dto.lineItems && dto.lineItems.length > 0) {
      const items = dto.lineItems.map((item) =>
        this.lineItemsRepository.create({
          invoiceId: saved.id,
          description: item.description,
          amount: item.amount,
          quantity: item.quantity ?? 1,
        }),
      );
      await this.lineItemsRepository.save(items);
    } else {
      // Default single line item
      await this.lineItemsRepository.save(
        this.lineItemsRepository.create({
          invoiceId: saved.id,
          description: dto.description || `${dto.type ?? 'rent'} charge`,
          amount: dto.amount,
          quantity: 1,
        }),
      );
    }

    return this.findOne(saved.id);
  }

  async generateRentInvoices(dto: GenerateRentInvoicesDto): Promise<Invoice[]> {
    if (new Date(dto.periodEnd) <= new Date(dto.periodStart)) {
      throw new BadRequestException('periodEnd must be after periodStart');
    }

    const qb = this.leasesRepository
      .createQueryBuilder('lease')
      .where('lease.status = :status', { status: LeaseStatus.ACTIVE });

    if (dto.leaseId) {
      qb.andWhere('lease.id = :leaseId', { leaseId: dto.leaseId });
    }

    const leases = await qb.getMany();
    if (leases.length === 0) {
      return [];
    }

    const dueDate =
      dto.dueDate ??
      dto.periodStart; // fallback – caller should normally supply dueDate

    const created: Invoice[] = [];

    for (const lease of leases) {
      // Skip if an invoice already exists for this lease + period
      const existing = await this.invoicesRepository.findOne({
        where: {
          leaseId: lease.id,
          periodStart: dto.periodStart,
          periodEnd: dto.periodEnd,
          type: InvoiceType.RENT,
        },
      });
      if (existing) continue;

      const invoice = await this.create({
        leaseId: lease.id,
        type: InvoiceType.RENT,
        amount: Number(lease.rentAmount),
        dueDate,
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
        description: `Rent for period ${dto.periodStart} to ${dto.periodEnd}`,
        lineItems: [
          {
            description: `Monthly rent`,
            amount: Number(lease.rentAmount),
            quantity: 1,
          },
        ],
      });
      created.push(invoice);
    }

    return created;
  }

  async findAll(filters?: {
    leaseId?: string;
    status?: InvoiceStatus;
    type?: InvoiceType;
  }): Promise<Invoice[]> {
    const qb = this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.lease', 'lease')
      .leftJoinAndSelect('invoice.lineItems', 'lineItems')
      .orderBy('invoice.createdAt', 'DESC');

    if (filters?.leaseId) {
      qb.andWhere('invoice.leaseId = :leaseId', { leaseId: filters.leaseId });
    }
    if (filters?.status) {
      qb.andWhere('invoice.status = :status', { status: filters.status });
    }
    if (filters?.type) {
      qb.andWhere('invoice.type = :type', { type: filters.type });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: ['lease', 'lease.tenant', 'lease.unit', 'lineItems'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot update a paid invoice');
    }
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled invoice');
    }

    Object.assign(invoice, dto);
    return this.invoicesRepository.save(invoice);
  }

  async markOverdue(): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);
    const result = await this.invoicesRepository
      .createQueryBuilder()
      .update(Invoice)
      .set({ status: InvoiceStatus.OVERDUE })
      .where('status = :pending', { pending: InvoiceStatus.PENDING })
      .andWhere('dueDate < :today', { today })
      .execute();
    return result.affected ?? 0;
  }

  async cancel(id: string): Promise<Invoice> {
    const invoice = await this.findOne(id);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid invoice');
    }
    invoice.status = InvoiceStatus.CANCELLED;
    return this.invoicesRepository.save(invoice);
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid invoice');
    }
    await this.invoicesRepository.remove(invoice);
  }
}
