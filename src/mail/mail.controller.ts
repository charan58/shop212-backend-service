import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // Test endpoint for password reset email (remove in production)
  @Post('test/reset-password')
  async testResetPassword(@Body() body: { email: string; name: string; resetToken: string }) {
    await this.mailService.sendPasswordResetEmail(body.email, body.name, body.resetToken);
    return { message: 'Reset password email sent successfully' };
  }

  // Test endpoint for welcome email (remove in production)
  @Post('test/welcome')
  async testWelcome(@Body() body: { email: string; name: string }) {
    await this.mailService.sendWelcomeEmail(body.email, body.name);
    return { message: 'Welcome email sent successfully' };
  }

  // Test endpoint for order confirmation (remove in production)
  @Post('test/order-confirmation')
  async testOrderConfirmation(@Body() body: { email: string; name: string; orderDetails: any }) {
    await this.mailService.sendOrderConfirmationEmail(body.email, body.name, body.orderDetails);
    return { message: 'Order confirmation email sent successfully' };
  }

  // Generic email endpoint
  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendEmail(@Body() body: { to: string; subject: string; html: string }) {
    await this.mailService.sendGenericEmail(body.to, body.subject, body.html);
    return { message: 'Email sent successfully' };
  }
}
