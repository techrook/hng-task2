// src/organisation/organisation.controller.ts
import { Controller, Get, Post, Param, Body, UseGuards, Req, UseFilters } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { OrganisationService } from './organisation.service';
import { AddUserDto } from './dto/add-user.dto';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { ValidationExceptionFilter } from '../exceptions/validation-exception.filter';

@Controller('api/organisations')
export class OrganisationController {
  constructor(private organisationService: OrganisationService) {}

  @UseGuards(JwtGuard)
  @Get()
  async getOrganisations(@Req() req) {
    return this.organisationService.getOrganisations(req.user.userId);
  }

  @UseGuards(JwtGuard)
  @Get(':orgId')
  async getOrganisation(@Param('orgId') orgId: string, @Req() req) {
    return this.organisationService.getOrganisation(orgId, req.user.userId);
  }

  @UseGuards(JwtGuard)
  @Post()
  @UseFilters(ValidationExceptionFilter)
  async createOrganisation(@Body() createOrganisationDto: CreateOrganisationDto, @Req() req) {
    return this.organisationService.createOrganisation(createOrganisationDto, req.user.userId);
  }

  @UseGuards(JwtGuard)
  @Post(':orgId/users')
  @UseFilters(ValidationExceptionFilter)
  async addUserToOrganisation(@Param('orgId') orgId: string, @Body() addUserDto: AddUserDto, @Req() req) {
    return this.organisationService.addUserToOrganisation(orgId, addUserDto, req.user.userId);
  }
}
