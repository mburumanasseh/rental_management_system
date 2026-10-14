import {
  IsString,
  IsOptional,
  MaxLength,
  IsUUID,
  IsNumber,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { UnitStatus } from '../entities/unit.entity.js';

export class CreateUnitDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  @MaxLength(50)
  unitNumber: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rentAmount: number;

  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sizeSqm?: number;

  @IsOptional()
  @IsString()
  amenities?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
