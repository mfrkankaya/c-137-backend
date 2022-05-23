import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { User } from './auth.model';
import { emailYup, getUserSecureDetails, passwordYup } from './auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async registerUser({ firstName, lastName, email, password }: RegisterDTO) {
    const [isEmailValid, isPasswordValid] = await Promise.all([
      emailYup.isValid(email),
      passwordYup.isValid(password),
    ]);

    if (!isEmailValid || !isPasswordValid || !firstName || !lastName)
      throw new HttpException(
        'bad-credentials',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    try {
      const storedUser = await this.userModel.findOne({ email });
      if (storedUser)
        throw new HttpException('already-exists', HttpStatus.CONFLICT);

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

      return { success: true, error: false, data: null };
    } catch (error) {
      throw new HttpException(
        'unknown-error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginUser({ email, password }: LoginDTO) {
    const [isEmailValid, isPasswordValid] = await Promise.all([
      emailYup.isValid(email),
      passwordYup.isValid(password),
    ]);

    if (!isEmailValid || !isPasswordValid)
      throw new HttpException(
        'bad-credentials',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    try {
      const user = await this.userModel.findOne({ email });
      if (!user)
        throw new HttpException('wrong-credentials', HttpStatus.UNAUTHORIZED);

      const isPasswordRight = bcrypt.compare(password, user.password);
      if (!isPasswordRight)
        throw new HttpException('wrong-credentials', HttpStatus.UNAUTHORIZED);

      const token = this.jwtService.sign(
        { userId: user.id },
        { secret: process.env.JWT_SECRET, expiresIn: '30d' },
      );

      return { success: true, error: false, data: { token } };
    } catch (error) {
      throw new HttpException(
        'unknown-error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserDetails(token: string) {
    let user: { userId: string };

    try {
      user = await this.jwtService.verifyAsync<{ userId: string }>(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new HttpException('unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const userDetails = await this.userModel.findById(user.userId);
      const userSecureDetails = getUserSecureDetails(userDetails);

      return { success: true, error: false, data: { user: userSecureDetails } };
    } catch (error) {
      throw new HttpException(
        'unknown-error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
