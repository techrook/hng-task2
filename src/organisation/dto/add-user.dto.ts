// src/organisation/dto/add-user.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class AddUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
