import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * M-Pesa Daraja API service (STK Push + helpers).
 * Designed to work with sandbox and production credentials from env.
 */
@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(private readonly config: ConfigService) {
    // Sandbox by default; switch to production URL when ready
    this.baseUrl =
      this.config.get<string>('nodeEnv') === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
  }

  private get consumerKey() {
    return this.config.get<string>('mpesa.consumerKey') || '';
  }
  private get consumerSecret() {
    return this.config.get<string>('mpesa.consumerSecret') || '';
  }
  private get shortcode() {
    return this.config.get<string>('mpesa.shortcode') || '';
  }
  private get passkey() {
    return this.config.get<string>('mpesa.passkey') || '';
  }
  private get callbackUrl() {
    return this.config.get<string>('mpesa.callbackUrl') || '';
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.consumerKey || !this.consumerSecret) {
      throw new BadRequestException(
        'M-Pesa credentials not configured (MPESA_CONSUMER_KEY / SECRET)',
      );
    }

    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`,
    ).toString('base64');

    const res = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
      },
    );

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Failed to get M-Pesa token: ${text}`);
      throw new BadRequestException('Unable to authenticate with M-Pesa');
    }

    const data = (await res.json()) as {
      access_token: string;
      expires_in: string;
    };
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (parseInt(data.expires_in, 10) - 60) * 1000;
    return this.accessToken;
  }

  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
    const password = Buffer.from(
      `${this.shortcode}${this.passkey}${timestamp}`,
    ).toString('base64');
    return { password, timestamp };
  }

  async initiateStkPush(params: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
  }): Promise<{
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
  }> {
    if (!this.shortcode || !this.passkey || !this.callbackUrl) {
      throw new BadRequestException(
        'M-Pesa shortcode, passkey or callback URL not configured',
      );
    }

    const token = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();

    const body = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(params.amount),
      PartyA: params.phoneNumber,
      PartyB: this.shortcode,
      PhoneNumber: params.phoneNumber,
      CallBackURL: this.callbackUrl,
      AccountReference: params.accountReference.slice(0, 12),
      TransactionDesc: params.transactionDesc.slice(0, 13),
    };

    const res = await fetch(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();
    if (!res.ok || data.ResponseCode !== '0') {
      this.logger.error('STK Push failed', data);
      throw new BadRequestException(
        data.ResponseDescription || data.errorMessage || 'STK Push failed',
      );
    }

    return data;
  }
}
