// src/organisation/organisation.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../typeorm/typeorm.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { AddUserDto } from './dto/add-user.dto';


@Injectable()
export class OrganisationService {
  constructor(private prisma: PrismaService) {}

  async getOrganisations(userId: string) {
    const organisations = await this.prisma.organisation.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: {
        organisations,
      },
    };
  }

  async getOrganisation(orgId: string, userId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: orgId },
      include: { users: true },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const isUserMember = organisation.users.some((user) => user.id === userId);

    if (!isUserMember) {
      throw new ForbiddenException('You do not have access to this organisation');
    }

    return {
      status: 'success',
      message: 'Organisation retrieved successfully',
      data: organisation,
    };
  }

  async createOrganisation(createOrganisationDto: CreateOrganisationDto, userId: string) {
    const organisation = await this.prisma.organisation.create({
      data: {
        ...createOrganisationDto,
        users: {
          connect: { id: userId },
        },
      },
    });

    return {
      status: 'success',
      message: 'Organisation created successfully',
      data: organisation,
    };
  }

  async addUserToOrganisation(orgId: string, addUserDto: AddUserDto, currentUserId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: orgId },
      include: { users: true },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const isUserMember = organisation.users.some((user) => user.id === currentUserId);

    if (!isUserMember) {
      throw new ForbiddenException('You do not have access to this organisation');
    }

    await this.prisma.organisation.update({
      where: { id: orgId },
      data: {
        users: {
          connect: { id: addUserDto.userId },
        },
      },
    });

    return {
      status: 'success',
      message: 'User added to organisation successfully',
    };
  }
}
