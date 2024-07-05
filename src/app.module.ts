import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { OrganisationModule } from './organisation/organisation.module';

@Module({
  imports: [UserModule, OrganisationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
