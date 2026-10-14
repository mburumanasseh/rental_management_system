import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service.js';
import { InvoicesController } from './invoices.controller.js';
import { Invoice } from './entities/invoice.entity.js';
import { InvoiceLineItem } from './entities/invoice-line-item.entity.js';
import { Lease } from '../leases/entities/lease.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceLineItem, Lease])],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
