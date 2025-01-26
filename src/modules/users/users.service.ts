import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async createUser(user: any, now: string) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const newUser = this.usersRepository.create({
        ...user,
        password: hashedPassword,
        lastLogin: now,
        createAt: now,
        updateAt: now,
        userExpirationDate: now,
        passwordExpirationDate: now,
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      throw new NotFoundException(`error: ${error.message}`);
    }
  }

  async getAllUsers() {
    return await this.usersRepository.find();
  }
}
