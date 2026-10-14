import { IsString, IsOptional, MaxLength, IsUUID, Matches } from 'class-validator';

export class CreateTenantDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nationalId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, { message: 'Invalid phone number' })
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
