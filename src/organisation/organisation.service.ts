// src/organisation/organisation.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { AddUserDto } from './dto/add-user.dto';
import { Organisation } from './organisation.entity';
import { User } from '../user/user.entity';

@Injectable()
export class OrganisationService {

  constructor(private readonly dataSource: DataSource,) {

  }

  async getOrganisations(userId: string) {
    const organisationRepository = this.dataSource.getRepository(Organisation);
    const organisations = await organisationRepository
      .createQueryBuilder('organisation')
      .leftJoinAndSelect('organisation.users', 'user')
      .where('user.userId = :userId', { userId })
      .getMany();
  
    return {
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: {
        organisations,
      },
    };
  }
  
  
  async getOrganisation(orgId: string, userId: string) {
    const organisationRepository = this.dataSource.getRepository(Organisation);
    const organisation = await organisationRepository.findOne({
      where: { orgId: orgId },
      relations: ['users'],
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const isUserMember = organisation.users.some((user) => user.userId === userId);

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
    const organisationRepository = this.dataSource.getRepository(Organisation);
    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { userId: userId } });

    const organisation = organisationRepository.create({
      ...createOrganisationDto,
      users: [user],
    });
    await organisationRepository.save(organisation);

    return {
      status: 'success',
      message: 'Organisation created successfully',
      data: organisation,
    };
  }

  async addUserToOrganisation(orgId: string, addUserDto: AddUserDto, currentUserId: string) {
    const organisationRepository = this.dataSource.getRepository(Organisation);
    const userRepository = this.dataSource.getRepository(User);

    const organisation = await organisationRepository.findOne({
      where: { orgId: orgId },
      relations: ['users'],
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const isUserMember = organisation.users.some((user) => user.userId === currentUserId);

    if (!isUserMember) {
      throw new ForbiddenException('You do not have access to this organisation');
    }

    const newUser = await userRepository.findOne({ where: { userId: addUserDto.userId } });

    organisation.users.push(newUser);
    await organisationRepository.save(organisation);

    return {
      status: 'success',
      message: 'User added to organisation successfully',
    };
  }
}
