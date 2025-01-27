import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Catalog } from '../catalog/catalog.entity';
import { Repository } from 'typeorm';
import { catalogsData, profilesData, usersData } from './seeder.data';
import { Profile } from '../profile/profile.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Catalog) private catalogsRepository: Repository<Catalog>,
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  async seed() {
    await this.seedCatalogs();
    await this.seedProfiles();
    await this.seedUsers();
  }

  private async seedUsers() {
    for (const user of usersData) {
      const exists = await this.usersRepository.findOne({
        where: { documentNum: user.documentNum },
      });

      if (!exists) {
        // 3. consulta el perfil por id
        const profile = await this.profilesRepository.findOne({
          where: { id: user.codprofile },
        });

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const newUser = this.usersRepository.create({
          ...user,
          password: hashedPassword,
          lastLogin: '2025-12-31',
          createAt: '2025-12-31',
          createdBy: '2025-12-31',
          updateAt: '2025-12-31',
          updatedBy: '2025-12-31',
          userExpirationDate: '2025-12-31',
          //userExpirationFlag: 1,
          passwordExpirationDate: '2025-12-31',
          //  passwordExpirationFlag: 1,
          profile: profile,
        });

        await this.usersRepository.save(newUser);
        this.logger.log(
          `Usuario '${newUser.patSurname} / ${newUser.matSurname}' added.`,
        );
      }
    }
  }

  private async seedProfiles() {
    for (const profile of profilesData) {
      const exists = await this.profilesRepository.findOne({
        where: { name: profile.name },
      });

      if (!exists) {
        await this.profilesRepository.save(profile);
        this.logger.log(
          `Profile '${profile.codeName} / ${profile.name}' added.`,
        );
      }
    }
  }

  private async seedCatalogs() {
    for (const catalog of catalogsData) {
      const exists = await this.catalogsRepository.findOne({
        where: { detail: catalog.detail },
      });

      if (!exists) {
        await this.catalogsRepository.save(catalog);
        this.logger.log(`Catalog '${catalog.name} / ${catalog.detail}' added.`);
      }
    }
  }
}
