import { IsString, IsOptional, MaxLength, IsUUID, IsInt, Min } from 'class-validator';

export class CreatePropertyDto {
  @IsUUID()
  landlordId: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  county?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalUnits?: number;
}
