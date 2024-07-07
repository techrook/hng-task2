// src/organisation/organisation.service.spec.ts

import { OrganisationService } from './organisation.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Organisation } from './organisation.entity';
import { User } from '../user/user.entity';

describe('OrganisationService', () => {
  let organisationService: OrganisationService;
  let dataSource: DataSource;

  beforeEach(() => {
    dataSource = new DataSource({ type: 'postgres', database: 'test' });
    organisationService = new OrganisationService(dataSource);
  });

  it('should throw ForbiddenException if user tries to access an organisation they do not belong to', async () => {
    const orgId = '1';
    const userId = '2';
    
    jest.spyOn(dataSource.getRepository(Organisation), 'findOne').mockResolvedValue({
      orgId,
      users: [{ userId: '3' }] as User[],
    } as Organisation);

    await expect(organisationService.getOrganisation(orgId, userId)).rejects.toThrow(ForbiddenException);
  });
});
