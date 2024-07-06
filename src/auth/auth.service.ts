// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Organisation } from '../organisation/organisation.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from '../user/dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    // private jwtService: JwtService,
    private jwt: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { firstName, lastName, email, password, phone } = createUserDto;
    const userRepository = this.dataSource.getRepository(User);
    const organisationRepository = this.dataSource.getRepository(Organisation);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });

    // Create and save the new organisation
    const organisation = organisationRepository.create({
      name: `${firstName}'s Organisation`,
      users: [user],
    });
    await organisationRepository.save(organisation);

    // Create the JWT payload and sign the token
    const accessToken = await this.signToken(user.id, user.email);
    await userRepository.save(user);
    return {
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken,
        user: {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    };
  }

  async login(user: LoginDto) {
    const userRepository = this.dataSource.getRepository(User);
    const uniqueUser = await userRepository.findOne({
      where: { email: user.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      user.password,
      uniqueUser.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }
    const accessToken = await this.signToken(uniqueUser.id, uniqueUser.email);
    return {
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          userId: uniqueUser.id,
          firstName: uniqueUser.firstName,
          lastName: uniqueUser.lastName,
          email: uniqueUser.email,
          phone: uniqueUser.phone,
        },
      },
    };
  }
  async signToken(id: string, email: string): Promise<string> {
    const payload = {
      sub: id,
      email,
    };
    const secret = process.env.JWT_SECRET;

    return this.jwt.signAsync(payload, {
      expiresIn: '5d',
      secret: secret,
    });
  }
}
