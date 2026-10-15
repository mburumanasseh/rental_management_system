import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReceiptDto {
  @IsUUID()
  paymentId: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  issuedTo?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
