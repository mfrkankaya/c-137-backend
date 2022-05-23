import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { generateSixDigitsCode } from 'src/common/utils';
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
      return { success: false, error: 'bad-credentials', data: null };

    const storedUser = await this.userModel.findOne({ email });
    if (storedUser)
      return { success: false, error: 'user-already-exist', data: null };

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

    return { success: true, error: false, data: null };
  }

  async loginUser({ email, password }: LoginDTO) {
    const [isEmailValid, isPasswordValid] = await Promise.all([
      emailYup.isValid(email),
      passwordYup.isValid(password),
    ]);

    if (!isEmailValid || !isPasswordValid)
      return { success: false, error: 'bad-credentials', data: null };

    const user = await this.userModel.findOne({ email });
    if (!user)
      return { success: false, error: 'wrong-credentials', data: null };

    const isPasswordRight = bcrypt.compare(password, user.password);
    if (!isPasswordRight)
      return { success: false, error: 'wrong-credentials', data: null };

    const token = this.jwtService.sign(
      { userId: user.id },
      { secret: process.env.JWT_SECRET, expiresIn: '30d' },
    );

    return { success: true, error: false, data: { token } };
  }

  async getUserDetails(token: string) {
    const user = await this.jwtService.verifyAsync<{ userId: string }>(token, {
      secret: process.env.JWT_SECRET,
    });

    const userDetails = await this.userModel.findById(user.userId);
    const userSecureDetails = getUserSecureDetails(userDetails);

    return { success: true, error: false, data: { user: userSecureDetails } };
  }

  async sendVerificationCode(email: string) {
    const verificationCode = generateSixDigitsCode();
    const user = await this.userModel.findOneAndUpdate({
      email,
      verificationCode,
    });
    if (!user) return { success: false, error: 'user-not-found', data: null };

    if (user.isEmailVerified)
      return { success: false, error: 'email-already-verified', data: null };

    this.mailService.sendVerificationCode({
      email,
      code: verificationCode.code,
    });

    return { success: true, error: false, data: null };
  }

  async verifyEmail(token: string, code: string) {
    const { userId } = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });

    const user = await this.userModel.findById(userId);
    if (!user) return { success: false, error: 'user-not-found', data: null };

    if (user.isEmailVerified)
      return { success: false, error: 'email-already-verified', data: null };

    const now = new Date().getTime();
    const codeCreatedAt = new Date(user.verificationCode.createdAt).getTime();
    const isCodeExpired = now - codeCreatedAt > 1000 * 60 * 5;
    if (isCodeExpired)
      return { success: false, error: 'code-expired', data: null };

    if (code !== user.verificationCode.code)
      return { success: false, error: 'wrong-code', data: null };

    await this.userModel.findByIdAndUpdate(userId, { isEmailVerified: true });
    return { success: true, error: false, data: null };
  }
}
