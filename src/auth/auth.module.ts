import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule,  } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
// import { DataSource } from 'typeorm';
@Module({
  imports: [ JwtModule.register({})],
  providers: [AuthService, JwtStrategy,],
  controllers: [AuthController]
})
export class AuthModule {}
