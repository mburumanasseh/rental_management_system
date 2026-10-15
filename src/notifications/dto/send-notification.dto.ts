import {
  IsEnum,
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  NotificationChannel,
  NotificationType,
} from '../entities/notification.entity.js';

export class SendNotificationDto {
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  @MaxLength(255)
  recipient: string; // phone number or email

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsString()
  body: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
