import { IsUUID, IsString, IsNumber, Min, Matches, IsOptional } from 'class-validator';

export class InitiateStkPushDto {
  @IsUUID()
  invoiceId: string;

  @IsString()
  @Matches(/^254[17]\d{8}$/, {
    message: 'phoneNumber must be in format 2547XXXXXXXX or 2541XXXXXXXX',
  })
  phoneNumber: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  amount?: number; // if omitted, uses remaining invoice balance
}
