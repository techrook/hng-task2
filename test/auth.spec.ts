// tests/auth.spec.ts

import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/user/user.entity';
import { Organisation } from '../src/organisation/organisation.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.getRepository(User).query('DELETE FROM users');
    await dataSource.getRepository(Organisation).query('DELETE FROM organisations');
  });

  it('should register user successfully with default organisation', async () => {
    const userDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password',
      phone: '1234567890',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userDto)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.user.firstName).toBe(userDto.firstName);
    expect(response.body.data.user.lastName).toBe(userDto.lastName);
    expect(response.body.data.user.email).toBe(userDto.email);
    expect(response.body.data.accessToken).toBeDefined();
  });

  it('should fail if required fields are missing', async () => {
    const userDto = {
      firstName: 'John',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userDto)
      .expect(422);

    expect(response.body.status).toBe('fail');
  });

  it('should fail if there is a duplicate email', async () => {
    const userDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password',
      phone: '1234567890',
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(userDto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userDto)
      .expect(422);

    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Email already in use');
  });
});
