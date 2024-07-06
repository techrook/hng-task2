// src/organisation/organisation.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../user/user.entity'; // Adjust the path as needed

@Entity()
export class Organisation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => User, user => user.organisations)
  @JoinTable()
  users: User[];
}
