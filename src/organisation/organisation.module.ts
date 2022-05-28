import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/auth.model';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import { OrganisationController } from './organisation.controller';
import { InvitationSchema, OrganisationSchema } from './organisation.model';
import { OrganisationService } from './organisation.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MongooseModule.forFeature([
      { name: 'Organisation', schema: OrganisationSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Invitation', schema: InvitationSchema },
    ]),
  ],
  controllers: [OrganisationController],
  providers: [OrganisationService, MailService, AuthService],
})
export class OrganisationModule {}
