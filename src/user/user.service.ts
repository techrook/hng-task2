// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(private dataSource: DataSource) {}

  async getUser(id: string, currentUserId: string) {
    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { userId: id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      status: 'success',
      message: 'User retrieved successfully',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    };
  }
}
