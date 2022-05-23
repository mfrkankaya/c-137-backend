import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Body() body: RegisterDTO) {
    return this.authService.registerUser(body);
  }

  @Post('login')
  loginUser(@Body() body: LoginDTO) {
    return this.authService.loginUser(body);
  }

  @Get('user')
  getUserDetails(@Headers('authorization') token: string) {
    return this.authService.getUserDetails(token);
  }

  @Post('send-verification-code')
  sendVerificationCode(@Body('email') email: string) {
    return this.authService.sendVerificationCode(email);
  }

  @Post('verify-email')
  verifyEmail(
    @Headers('authorization') token: string,
    @Body('code') code: string,
  ) {
    return this.authService.verifyEmail(token, code);
  }
}
