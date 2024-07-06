import { Module } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { OrganisationController } from './organisation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './organisation.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Organisation])],
  exports: [OrganisationService],
  providers: [OrganisationService,],
  controllers: [OrganisationController],
})
export class OrganisationModule {}
