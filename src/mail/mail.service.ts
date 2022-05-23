import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SendVerificationCodeDTO } from './mail.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationCode({ email, code }: SendVerificationCodeDTO) {
    this.mailerService.sendMail({
      to: email,
      subject: 'E-posta onaylama.',
      template: 'email-verification-code',
      context: {
        code,
      },
    });
  }
}
