import { Injectable, ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../user/user.entity'; // Adjust the path as needed
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private dataSource: DataSource;
    constructor(
      private databaseService: DatabaseService,
        private readonly jwtService: JwtService,
      ) {
        this.dataSource = this.databaseService.getDataSource();
      }
      async create(createUserDto: CreateUserDto) {
        const { firstName, lastName, email, password, phone } = createUserDto;
        const userRepository = this.dataSource.getRepository(User)
        const organisationRepository = this.dataSource.getRepository(User)
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
          throw new ConflictException('Email already in use');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = await userRepository.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phone,
        });
    
        const organisation = await this.prisma.organisation.create({
          data: {
            name: `${firstName}'s Organisation`,
            users: { connect: { id: user.id } },
          },
        });
    
        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload);
    
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
    
      async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && await bcrypt.compare(password, user.password)) {
          const { password, ...result } = user;
          return result;
        }
        throw new UnprocessableEntityException('Invalid credentials');
      }
    
      async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
          accessToken: this.jwtService.sign(payload),
          user,
        };
      }
}
