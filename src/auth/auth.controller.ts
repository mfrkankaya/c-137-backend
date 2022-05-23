import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Post,
  Req,
  Request,
} from '@nestjs/common';
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
  getUserDetails(@Headers('authorization') authorization: string) {
    return this.authService.getUserDetails(authorization);
  }
}
