import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptsService } from './receipts.service.js';
import { ReceiptsController } from './receipts.controller.js';
import { Receipt } from './entities/receipt.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Receipt, Payment])],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
