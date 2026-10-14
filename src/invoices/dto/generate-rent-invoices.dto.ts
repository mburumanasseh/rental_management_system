import { IsUUID, IsDateString, IsOptional } from 'class-validator';

export class GenerateRentInvoicesDto {
  @IsOptional()
  @IsUUID()
  leaseId?: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
