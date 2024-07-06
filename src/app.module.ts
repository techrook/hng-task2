// src/app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OrganisationModule } from './organisation/organisation.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './config/typeorm.config'; // Adjust the path as needed
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    OrganisationModule,
    ConfigModule.forRoot({
      load: [typeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('typeorm'),
      inject: [ConfigService],
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [DatabaseService],
})
export class AppModule {}
