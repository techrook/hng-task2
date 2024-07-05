import { Module } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { OrganisationController } from './organisation.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [OrganisationService, PrismaService],
  controllers: [OrganisationController]
})
export class OrganisationModule {}
