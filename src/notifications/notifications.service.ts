import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from './entities/notification.entity.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { SmsProvider } from './providers/sms.provider.js';
import { EmailProvider } from './providers/email.provider.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly smsProvider: SmsProvider,
    private readonly emailProvider: EmailProvider,
  ) {}

  async send(dto: SendNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      channel: dto.channel,
      type: dto.type ?? NotificationType.GENERAL,
      userId: dto.userId ?? null,
      recipient: dto.recipient,
      subject: dto.subject ?? null,
      body: dto.body,
      metadata: dto.metadata ?? null,
      status: NotificationStatus.PENDING,
    });

    const saved = await this.notificationsRepository.save(notification);

    try {
      let result: { success: boolean; messageId?: string; error?: string };

      if (dto.channel === NotificationChannel.SMS) {
        result = await this.smsProvider.send(dto.recipient, dto.body);
      } else if (dto.channel === NotificationChannel.EMAIL) {
        result = await this.emailProvider.send(
          dto.recipient,
          dto.subject || 'Notification',
          dto.body,
        );
      } else {
        // in_app – just persist
        result = { success: true, messageId: saved.id };
      }

      if (result.success) {
        saved.status = NotificationStatus.SENT;
        saved.sentAt = new Date();
        if (result.messageId) {
          saved.metadata = {
            ...(saved.metadata || {}),
            providerMessageId: result.messageId,
          };
        }
      } else {
        saved.status = NotificationStatus.FAILED;
        saved.errorMessage = result.error || 'Unknown error';
      }
    } catch (err) {
      saved.status = NotificationStatus.FAILED;
      saved.errorMessage = err instanceof Error ? err.message : 'Send failed';
      this.logger.error(`Notification ${saved.id} failed`, err);
    }

    return this.notificationsRepository.save(saved);
  }

  async sendPaymentReceived(params: {
    userId?: string;
    phone?: string;
    email?: string;
    amount: number;
    invoiceNumber?: string;
    receiptNumber?: string;
  }): Promise<void> {
    const body = `Payment of KES ${params.amount.toLocaleString()} received${
      params.invoiceNumber ? ` for invoice ${params.invoiceNumber}` : ''
    }${params.receiptNumber ? `. Receipt: ${params.receiptNumber}` : ''}. Thank you.`;

    if (params.phone) {
      await this.send({
        channel: NotificationChannel.SMS,
        type: NotificationType.PAYMENT_RECEIVED,
        userId: params.userId,
        recipient: params.phone,
        body,
      });
    }
    if (params.email) {
      await this.send({
        channel: NotificationChannel.EMAIL,
        type: NotificationType.PAYMENT_RECEIVED,
        userId: params.userId,
        recipient: params.email,
        subject: 'Payment Received',
        body,
      });
    }
  }

  async sendPaymentReminder(params: {
    userId?: string;
    phone?: string;
    email?: string;
    amount: number;
    dueDate: string;
    invoiceNumber: string;
  }): Promise<void> {
    const body = `Reminder: Invoice ${params.invoiceNumber} of KES ${params.amount.toLocaleString()} is due on ${params.dueDate}. Please pay to avoid late fees.`;

    if (params.phone) {
      await this.send({
        channel: NotificationChannel.SMS,
        type: NotificationType.PAYMENT_REMINDER,
        userId: params.userId,
        recipient: params.phone,
        body,
      });
    }
    if (params.email) {
      await this.send({
        channel: NotificationChannel.EMAIL,
        type: NotificationType.PAYMENT_REMINDER,
        userId: params.userId,
        recipient: params.email,
        subject: `Payment Reminder – ${params.invoiceNumber}`,
        body,
      });
    }
  }

  async findAll(filters?: {
    userId?: string;
    channel?: NotificationChannel;
    status?: NotificationStatus;
  }): Promise<Notification[]> {
    const qb = this.notificationsRepository
      .createQueryBuilder('n')
      .orderBy('n.createdAt', 'DESC')
      .take(100);

    if (filters?.userId) {
      qb.andWhere('n.userId = :userId', { userId: filters.userId });
    }
    if (filters?.channel) {
      qb.andWhere('n.channel = :channel', { channel: filters.channel });
    }
    if (filters?.status) {
      qb.andWhere('n.status = :status', { status: filters.status });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<Notification | null> {
    return this.notificationsRepository.findOne({ where: { id } });
  }
}
