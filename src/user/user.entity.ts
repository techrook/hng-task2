// src/user/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Organisation } from '../organisation/organisation.entity'; // Adjust the path as needed

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @ManyToMany(() => Organisation, organisation => organisation.users)
  organisations: Organisation[];
}
