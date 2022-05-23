import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { BullModule } from 'nest-bull';

// const bullModule = BullModule.forRoot({});
@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        secure: true,
        tls: {
          ciphers: 'SSLv3',
        },
        requireTLS: true,
        port: parseInt(process.env.MAIL_PORT),
        debug: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@furkankaya.dev>',
      },
      template: {
        dir: process.cwd() + '/src/mail-templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    MongooseModule.forRoot(process.env.MONGO),
    AuthModule,
  ],
})
export class AppModule {}
