import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service.js';
import { ReportsController } from './reports.controller.js';
import { Invoice } from '../invoices/entities/invoice.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { Lease } from '../leases/entities/lease.entity.js';
import { Unit } from '../units/entities/unit.entity.js';
import { Property } from '../properties/entities/property.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Payment, Lease, Unit, Property]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
