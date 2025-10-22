import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendPasswordResetEmail(to: string, name: string, resetToken: string) {
    try {
      const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;

      await this.mailerService.sendMail({
        to,
        subject: 'Reset your password - Shop212',
        template: './reset-password',
        context: {
          name,
          resetUrl,
        },
        from: `"Shop212 Support" <support@shop212.com>`,
        replyTo: this.configService.get<string>('EMAIL_USER', 'cs5156023@gmail.com'),
      });

      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Welcome to Shop212!',
        template: './welcome',
        context: {
          name,
          loginUrl: `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/login`,
        },
        from: `"Shop212 Team" <welcome@shop212.com>`,
        replyTo: this.configService.get<string>('EMAIL_USER', 'cs5156023@gmail.com'),
      });

      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendOrderConfirmationEmail(to: string, name: string, orderDetails: any) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `Order Confirmation - #${orderDetails.orderId}`,
        template: './order-confirmation',
        context: {
          name,
          orderDetails,
          trackingUrl: `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/orders/${orderDetails.orderId}`,
        },
        from: `"Shop212 Orders" <orders@shop212.com>`,
        replyTo: this.configService.get<string>('EMAIL_USER', 'cs5156023@gmail.com'),
      });

      this.logger.log(`Order confirmation email sent to ${to} for order ${orderDetails.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email to ${to}:`, error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  async sendGenericEmail(to: string, subject: string, html: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html,
        from: `"Shop212" <noreply@shop212.com>`,
        replyTo: this.configService.get<string>('EMAIL_USER', 'cs5156023@gmail.com'),
      });

      this.logger.log(`Generic email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send generic email to ${to}:`, error);
      throw new Error('Failed to send email');
    }
  }
}
