import { IsString, IsOptional, MaxLength } from 'class-validator';

export class TerminateLeaseDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
