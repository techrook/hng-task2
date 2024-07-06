// src/user/user.controller.ts
import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get(':id')
  async getUser(@Param('id') id: string, @Req() req) {
    return this.userService.getUser(id, req.user.userId);
  }
}
