import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity.js';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity.js';
import { Lease, LeaseStatus } from '../leases/entities/lease.entity.js';
import { Unit, UnitStatus } from '../units/entities/unit.entity.js';
import { Property } from '../properties/entities/property.entity.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoicesRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Lease)
    private readonly leasesRepository: Repository<Lease>,
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  async getOccupancySummary() {
    const totalUnits = await this.unitsRepository.count();
    const occupied = await this.unitsRepository.count({
      where: { status: UnitStatus.OCCUPIED },
    });
    const vacant = await this.unitsRepository.count({
      where: { status: UnitStatus.VACANT },
    });
    const maintenance = await this.unitsRepository.count({
      where: { status: UnitStatus.MAINTENANCE },
    });

    return {
      totalUnits,
      occupied,
      vacant,
      maintenance,
      occupancyRate:
        totalUnits > 0
          ? Number(((occupied / totalUnits) * 100).toFixed(2))
          : 0,
    };
  }

  async getArrearsSummary() {
    const overdue = await this.invoicesRepository.find({
      where: { status: InvoiceStatus.OVERDUE },
      relations: ['lease', 'lease.tenant', 'lease.unit'],
    });

    const pending = await this.invoicesRepository.find({
      where: { status: InvoiceStatus.PENDING },
      relations: ['lease'],
    });

    const totalOverdue = overdue.reduce(
      (sum, inv) => sum + (Number(inv.amount) - Number(inv.amountPaid)),
      0,
    );
    const totalPending = pending.reduce(
      (sum, inv) => sum + (Number(inv.amount) - Number(inv.amountPaid)),
      0,
    );

    return {
      overdueCount: overdue.length,
      overdueAmount: Number(totalOverdue.toFixed(2)),
      pendingCount: pending.length,
      pendingAmount: Number(totalPending.toFixed(2)),
      overdueInvoices: overdue.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        amountPaid: inv.amountPaid,
        dueDate: inv.dueDate,
        leaseId: inv.leaseId,
      })),
    };
  }

  async getCashFlowSummary(from?: string, to?: string) {
    const qb = this.paymentsRepository
      .createQueryBuilder('p')
      .where('p.status = :status', { status: PaymentStatus.COMPLETED });

    if (from) {
      qb.andWhere('p.paidAt >= :from', { from });
    }
    if (to) {
      qb.andWhere('p.paidAt <= :to', { to });
    }

    const payments = await qb.getMany();
    const totalCollected = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    return {
      from: from || null,
      to: to || null,
      paymentCount: payments.length,
      totalCollected: Number(totalCollected.toFixed(2)),
    };
  }

  async getLeaseSummary() {
    const active = await this.leasesRepository.count({
      where: { status: LeaseStatus.ACTIVE },
    });
    const draft = await this.leasesRepository.count({
      where: { status: LeaseStatus.DRAFT },
    });
    const terminated = await this.leasesRepository.count({
      where: { status: LeaseStatus.TERMINATED },
    });
    const expired = await this.leasesRepository.count({
      where: { status: LeaseStatus.EXPIRED },
    });

    return { active, draft, terminated, expired, total: active + draft + terminated + expired };
  }

  async getDashboard() {
    const [occupancy, arrears, cashFlow, leases, propertyCount] =
      await Promise.all([
        this.getOccupancySummary(),
        this.getArrearsSummary(),
        this.getCashFlowSummary(),
        this.getLeaseSummary(),
        this.propertiesRepository.count(),
      ]);

    return {
      properties: propertyCount,
      occupancy,
      arrears: {
        overdueCount: arrears.overdueCount,
        overdueAmount: arrears.overdueAmount,
        pendingCount: arrears.pendingCount,
        pendingAmount: arrears.pendingAmount,
      },
      cashFlow,
      leases,
      generatedAt: new Date().toISOString(),
    };
  }
}
