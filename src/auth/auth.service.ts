import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import {
  createErrorResponse,
  createSuccessResponse,
  generateSixDigitsCode,
} from 'src/common/utils';
import { MailService } from 'src/mail/mail.service';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { User } from './auth.model';
import { emailYup, getUserSecureDetails, passwordYup } from './auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async registerUser({ firstName, lastName, email, password }: RegisterDTO) {
    const [isEmailValid, isPasswordValid] = await Promise.all([
      emailYup.isValid(email),
      passwordYup.isValid(password),
    ]);

    if (!isEmailValid || !isPasswordValid || !firstName || !lastName)
      return createErrorResponse('bad-credentials');

    const storedUser = await this.userModel.findOne({ email });
    if (storedUser) return createErrorResponse('user-already-exist');

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      firstName,
      lastName,
      email,
      password: passwordHash,
      organisationId: null,
      isEmailVerified: false,
    });

    await newUser.save();

    this.sendVerificationCode(email);

    return createSuccessResponse(null);
  }

  async loginUser({ email, password }: LoginDTO) {
    const [isEmailValid, isPasswordValid] = await Promise.all([
      emailYup.isValid(email),
      passwordYup.isValid(password),
    ]);

    if (!isEmailValid || !isPasswordValid)
      return createErrorResponse('bad-credentials');

    const user = await this.userModel.findOne({ email });
    if (!user) return createErrorResponse('wrong-credentials');

    const isPasswordRight = bcrypt.compare(password, user.password);
    if (!isPasswordRight) return createErrorResponse('wrong-credentials');

    const token = this.jwtService.sign(
      { userId: user.id },
      { secret: process.env.JWT_SECRET, expiresIn: '30d' },
    );

    return createSuccessResponse({ token });
  }

  async getUserDetails(token: string) {
    if (!token) return createErrorResponse('token-required');

    try {
      const user = await this.jwtService.verifyAsync<JwtData>(token, {
        secret: process.env.JWT_SECRET,
      });

      const userDetails = await this.userModel.findById(user.userId);
      if (!userDetails) return createErrorResponse('user-not-found');

      const userSecureDetails = getUserSecureDetails(userDetails);

      return createSuccessResponse({ user: userSecureDetails });
    } catch (error) {
      if (error.message === 'invalid token')
        return createErrorResponse('invalid-token');
      return createErrorResponse('unknown-error');
    }
  }

  async sendVerificationCode(email: string) {
    try {
      const verificationCode = generateSixDigitsCode();
      const user = await this.userModel.findOneAndUpdate({
        email,
        verificationCode,
      });
      if (!user) return createErrorResponse('user-not-found');

      if (user.isEmailVerified)
        return createErrorResponse('email-already-verified');

      this.mailService.sendVerificationCode({
        email,
        code: verificationCode.code,
      });

      return createSuccessResponse(null);
    } catch (error) {
      return createErrorResponse('unknown-error');
    }
  }

  async verifyEmail(token: string, code: string) {
    try {
      const { userId } = await this.jwtService.verifyAsync<JwtData>(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userModel.findById(userId);
      if (!user) return createErrorResponse('user-not-found');

      if (user.isEmailVerified)
        return createErrorResponse('email-already-verified');

      const now = new Date().getTime();
      const codeCreatedAt = new Date(user.verificationCode.createdAt).getTime();
      const isCodeExpired = now - codeCreatedAt > 1000 * 60 * 5;
      if (isCodeExpired) return createErrorResponse('code-expired');

      if (code !== user.verificationCode.code)
        return createErrorResponse('wrong-code');

      await this.userModel.findByIdAndUpdate(userId, { isEmailVerified: true });
      return createSuccessResponse(null);
    } catch (error) {
      if (error.message === 'invalid token')
        return createErrorResponse('invalid-token');
      return createErrorResponse('unknown-error');
    }
  }
}
