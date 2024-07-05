// src/organisation/organisation.controller.ts
import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganisationService } from './organisation.service';
import { AddUserDto } from './dto/add-user.dto';
import { CreateOrganisationDto } from './dto/create-organisation.dto';

@Controller('api/organisations')
export class OrganisationController {
  constructor(private organisationService: OrganisationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getOrganisations(@Req() req) {
    return this.organisationService.getOrganisations(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':orgId')
  async getOrganisation(@Param('orgId') orgId: string, @Req() req) {
    return this.organisationService.getOrganisation(orgId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrganisation(@Body() createOrganisationDto: CreateOrganisationDto, @Req() req) {
    return this.organisationService.createOrganisation(createOrganisationDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':orgId/users')
  async addUserToOrganisation(@Param('orgId') orgId: string, @Body() addUserDto: AddUserDto, @Req() req) {
    return this.organisationService.addUserToOrganisation(orgId, addUserDto, req.user.userId);
  }
}
