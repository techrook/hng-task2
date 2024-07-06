import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  providers: [UserService, JwtStrategy],
  controllers: [UserController]
})
export class UserModule {}
