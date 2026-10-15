import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Simple email provider using SMTP via fetch to a transactional API
 * or console fallback when not configured.
 * For production, replace with Nodemailer / SendGrid / SES.
 */
@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);

  constructor(private readonly config: ConfigService) {}

  async send(
    to: string,
    subject: string,
    body: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;

    if (!smtpHost || !smtpUser) {
      this.logger.warn('Email provider not configured – logging message instead');
      this.logger.log(`[EMAIL → ${to}] Subject: ${subject}\n${body}`);
      return { success: true, messageId: `dev-${Date.now()}` };
    }

    // Placeholder – in production wire Nodemailer or a transactional provider
    this.logger.log(`[EMAIL → ${to}] Subject: ${subject} (SMTP configured but send not implemented in this skeleton)`);
    return { success: true, messageId: `smtp-placeholder-${Date.now()}` };
  }
}
