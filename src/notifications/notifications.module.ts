import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { Notification } from './entities/notification.entity.js';
import { SmsProvider } from './providers/sms.provider.js';
import { EmailProvider } from './providers/email.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationsService, SmsProvider, EmailProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
