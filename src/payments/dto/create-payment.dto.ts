import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity.js';

export class CreatePaymentDto {
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
