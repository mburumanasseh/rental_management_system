import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { Payment } from './entities/payment.entity.js';
import { Invoice } from '../invoices/entities/invoice.entity.js';
import { MpesaService } from './mpesa/mpesa.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Invoice])],
  controllers: [PaymentsController],
  providers: [PaymentsService, MpesaService],
  exports: [PaymentsService, MpesaService],
})
export class PaymentsModule {}
