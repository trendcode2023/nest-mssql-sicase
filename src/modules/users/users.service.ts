import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';
import { Catalog } from '../catalog/catalog.entity';
import { Profile } from '../profile/profile.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Catalog) private catalogsRepository: Repository<Catalog>,
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
  ) {}

  async createUser(user: any, now: string) {
    try {
      // consulta si existe el tipo de documento
      const documentType = await this.catalogsRepository.findOne({
        where: { id: user.documentType },
      });
      console.log(documentType);
      // consulta si existe el profile
      const profile = await this.profilesRepository.findOne({
        where: { id: user.profile },
      });
      console.log(profile);
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const newUser = this.usersRepository.create({
        ...user,
        password: hashedPassword,
        lastLogin: now,
        createAt: now,
        updateAt: now,
        userExpirationDate: now,
        passwordExpirationDate: now,
        catalog: documentType,
        profile: profile,
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      throw new NotFoundException(`error: ${error.message}`);
    }
  }

  async getAllUsers() {
    return await this.usersRepository.find({
      relations: ['catalog'],
    });
  }
}
