// src/auth/auth.controller.ts
import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../user/dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ValidationPipe()) registerDto: CreateUserDto) {
      return await this.authService.create(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body(new ValidationPipe())  loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
