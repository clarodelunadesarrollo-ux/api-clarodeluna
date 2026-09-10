import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = this.config.get<string>('MAIL_FROM') ?? 'Claro de Luna <onboarding@resend.dev>';
  }

  async sendOtpCode(email: string, code: string): Promise<void> {
    if (!this.resend) {
      // No provider configured (local dev): log the code so the flow is testable.
      this.logger.warn(`[DEV] OTP for ${email}: ${code}`);
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to: email,
      subject: 'Tu código de acceso — Claro de Luna',
      html: this.buildOtpEmail(code),
    });
  }

  private buildOtpEmail(code: string): string {
    return `
      <div style="font-family: system-ui, sans-serif; color: #2E4A2E;">
        <h2>Claro de Luna</h2>
        <p>Tu código de acceso es:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
        <p>Vence en 10 minutos. Si no solicitaste este código, ignorá este correo.</p>
      </div>
    `;
  }
}
