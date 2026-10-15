import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * SMS provider (Africa's Talking style).
 * Uses fetch so no extra dependency is required.
 * Configure AFRICASTALKING_API_KEY + AFRICASTALKING_USERNAME in .env.
 */
@Injectable()
export class SmsProvider {
  private readonly logger = new Logger(SmsProvider.name);

  constructor(private readonly config: ConfigService) {}

  async send(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const apiKey = this.config.get<string>('AFRICASTALKING_API_KEY') || process.env.AFRICASTALKING_API_KEY;
    const username = this.config.get<string>('AFRICASTALKING_USERNAME') || process.env.AFRICASTALKING_USERNAME || 'sandbox';

    if (!apiKey) {
      this.logger.warn('SMS provider not configured – logging message instead');
      this.logger.log(`[SMS → ${to}] ${message}`);
      return { success: true, messageId: `dev-${Date.now()}` };
    }

    try {
      const params = new URLSearchParams({
        username,
        to,
        message,
      });

      const res = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          apiKey,
          Accept: 'application/json',
        },
        body: params.toString(),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: JSON.stringify(data) };
      }

      const msg = data?.SMSMessageData?.Recipients?.[0];
      return {
        success: msg?.status === 'Success',
        messageId: msg?.messageId,
        error: msg?.status !== 'Success' ? msg?.status : undefined,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'SMS send failed';
      this.logger.error(error);
      return { success: false, error };
    }
  }
}
