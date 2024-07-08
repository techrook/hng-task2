import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service'
import { OrganisationService } from '../src/organisation/organisation.service';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../src/user/user.entity';
import { ConflictException, HttpException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let organisationService: OrganisationService
  let jwtService: JwtService;
  let dataSource: Partial<Record<'getRepository', jest.Mock>>; // Define type for dataSource

  beforeEach(async () => {
    dataSource = {
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        OrganisationService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(() => 'mocked_access_token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    organisationService = module.get<OrganisationService>(OrganisationService)
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('Token Generation', () => {
    it('should generate a valid token with expiry', async () => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        userId: 'user_id',
        email: 'user@example.com',
        password: await bcrypt.hash('password', 10),
        phone: '9999999999',
      };

      jest.spyOn(dataSource, 'getRepository').mockReturnValue({
        findOne: jest.fn().mockResolvedValue(user),
      } as any);

      const accessToken = await authService.signToken(user.userId, user.email);

      expect(accessToken).toEqual('mocked_access_token');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.userId, email: user.email },
        { expiresIn: '5d' }
      );
    });
  });

  describe('User Registration', () => {
    it('should register user successfully', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        phone: '1234567890',
      };
      const createdOrganisation = {
        id: 1,
        name: 'Default Organisation Name',
        user: {
          userId: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
        },
      };


      const userRepository = {
        findOne: jest.fn().mockResolvedValue(null), // No existing user
        create: jest.fn().mockReturnValue(createUserDto as any),
        save: jest.fn().mockResolvedValue(createUserDto as any),
      } as any;


      const organisationRepository = {
        save: jest.fn().mockResolvedValue(createdOrganisation as any),
        find: jest.fn().mockResolvedValue([createdOrganisation as any]),
      };

      jest.spyOn(dataSource, 'getRepository').mockReturnValue([userRepository,organisationRepository]);
      // jest.spyOn(dataSource, 'getRepository').mockReturnValue(organisationRepository);

      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed_password');


      const result = await authService.create(createUserDto);
      const testUser = result.data.user
      const resultOrganisation = await organisationService.getOrganisations(testUser.userId)
      

      expect(result.status).toEqual('success');
      expect(result.message).toEqual('Registration successful');
      expect(result.data.accessToken).toEqual('mocked_access_token');
      expect(result.data.user.firstName).toEqual('John');
      expect(result.data.user.lastName).toEqual('Doe');
      expect(result.data.user.email).toEqual('john.doe@example.com');
      expect(resultOrganisation[0].status).toEqual("success")
    });

    it('should throw ConflictException if email is already in use', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        phone: '1234567890',
      };

      const userRepository = {
        findOne: jest.fn().mockResolvedValue({ email: 'john.doe@example.com' } as any),
      } as any;

      jest.spyOn(dataSource, 'getRepository').mockReturnValue(userRepository);

      await expect(authService.create(createUserDto)).rejects.toThrowError(ConflictException);
    });
  });

  describe('User Login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginDto = {
        email: 'john.doe@example.com',
        password: 'password',
      };

      const user = {
        userId: 'user_id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password', 10),
        phone: '1234567890',
      };

      const userRepository = {
        findOne: jest.fn().mockResolvedValue(user),
      } as any;

      jest.spyOn(dataSource, 'getRepository').mockReturnValue(userRepository);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.login(loginDto);

      expect(result.status).toEqual('success');
      expect(result.message).toEqual('Login successful');
      expect(result.data.accessToken).toEqual('mocked_access_token');
      expect(result.data.user.firstName).toEqual('John');
      expect(result.data.user.lastName).toEqual('Doe');
      expect(result.data.user.email).toEqual('john.doe@example.com');
    });

    it('should throw NotFoundException if user not found', async () => {
      const loginDto = {
        email: 'john.doe@example.com',
        password: 'password',
      };

      const userRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      } as any;

      jest.spyOn(dataSource, 'getRepository').mockReturnValue(userRepository);

      await expect(authService.login(loginDto)).rejects.toThrowError(NotFoundException);
    });

    it('should throw HttpException if password is incorrect', async () => {
      const loginDto = {
        email: 'john.doe@example.com',
        password: 'password',
      };

      const userRepository = {
        findOne: jest.fn().mockResolvedValue({ password: 'hashed_password' } as any),
      } as any;

      jest.spyOn(dataSource, 'getRepository').mockReturnValue(userRepository);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.login(loginDto)).rejects.toThrowError(HttpException);
    });
  });
});
