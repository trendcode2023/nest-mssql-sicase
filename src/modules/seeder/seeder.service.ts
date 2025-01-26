import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Catalog } from '../catalog/catalog.entity';
import { Repository } from 'typeorm';
import { catalogsData, profilesData } from './seeder.data';
import { Profile } from '../profile/profile.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Catalog) private catalogsRepository: Repository<Catalog>,
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
  ) {}

  async seed() {
    await this.seedCatalogs();
    await this.seedProfiles();
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
