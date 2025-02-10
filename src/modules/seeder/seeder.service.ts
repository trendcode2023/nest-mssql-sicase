import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Catalog } from '../catalog/catalog.entity';
import { Repository } from 'typeorm';
import {
  authorizationsData,
  catalogsData,
  modulosData,
  profilesData,
  questsData,
  routesData,
  usersData,
} from './seeder.data';
import { Profile } from '../profile/profile.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import * as bcrypt from 'bcrypt';

import { Modulo } from '../modulos/modulos.entity';
import { Route } from '../routes/routes.entity';
import { Authorization } from '../authorizations/authorizations.entity';
import { Quest } from '../quest/quest.entity';
@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Catalog) private catalogsRepository: Repository<Catalog>,
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Modulo) private modulosRepository: Repository<Modulo>,
    @InjectRepository(Route) private routesRepository: Repository<Route>,
    @InjectRepository(Authorization)
    private authorizationsRepository: Repository<Authorization>,
    @InjectRepository(Quest)
    private questsRepository: Repository<Quest>,
    private readonly usersService: UsersService,
  ) {}

  async seed() {
    await this.seedCatalogs();
    await this.seedProfiles();
    await this.seedUsers();
    await this.seedModulos();
    await this.seedRoutes();
    await this.seedAuthorizations();
    await this.seedQuests();
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
          //lastLogin: '',
          createAt: new Date().toISOString(),
          createdBy: '12345678',
          updateAt: new Date().toISOString(),
          updatedBy: '12345678',
          userExpirationDate: '2025-12-31',
          //userExpirationFlag: 1,
          passwordExpirationDate: '2025-12-31',
          //  passwordExpirationFlag: 1,
          profile: profile,
        });

        await this.usersRepository.save(newUser);
        this.logger.log(
          `User: '${newUser.patSurname} / ${newUser.matSurname}' added.`,
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
          `Profile: '${profile.codeName} / ${profile.name}' added.`,
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
        this.logger.log(
          `Catalog: '${catalog.name} / ${catalog.detail}' added.`,
        );
      }
    }
  }

  private async seedModulos() {
    for (const modulo of modulosData) {
      const exists = await this.modulosRepository.findOne({
        where: { code: modulo.code },
      });

      if (!exists) {
        await this.modulosRepository.save(modulo);
        this.logger.log(
          `Modulo: '${modulo.code} / ${modulo.description}' added.`,
        );
      }
    }
  }

  private async seedRoutes() {
    for (const route of routesData) {
      // Buscar el módulo correspondiente
      const modulo = await this.modulosRepository.findOne({
        where: { id: route.modulo },
      });

      if (!modulo) {
        this.logger.warn(`Modulo '${route.modulo}' no encontrado. Saltando...`);
        continue; // Si el módulo no existe, omite la inserción
      }

      // Verificar si la ruta ya existe en la base de datos
      const exists = await this.routesRepository.findOne({
        where: { code: route.code },
      });

      if (!exists) {
        await this.routesRepository.save({
          code: route.code,
          description: route.description,
          order: route.order,
          modulo: modulo, // Asignamos el objeto completo
        });
      }
      this.logger.log(`Ruta '${route.code} / ${route.description}' añadida.`);
    }
  }

  private async seedAuthorizations() {
    for (const authorization of authorizationsData) {
      const exists = await this.authorizationsRepository.findOne({
        where: { code: authorization.code },
      });

      if (!exists) {
        // 3. consulta el perfil por id
        const route = await this.routesRepository.findOne({
          where: { id: authorization.codeRoute },
        });

        const profile = await this.profilesRepository.findOne({
          where: { id: authorization.codeProfile },
        });
        const newAuthorization = this.authorizationsRepository.create({
          ...authorization,
          route: route,
          profile: profile,
        });

        await this.authorizationsRepository.save(newAuthorization);
        this.logger.log(`Authorization: '${newAuthorization.code}' added.`);
      }
    }
  }

  private async seedQuests() {
    try {
      for (const quest of questsData) {
        const exists = await this.questsRepository.findOne({
          where: { pdfName: quest.pdfName },
        });

        if (!exists) {
          await this.questsRepository.save(quest);
          this.logger.log(`Quest: '${quest.pdfName}' added.`);
        }
      }
    } catch (error) {
      this.logger.log(`Quest: '${error}' added.`);
    }
  }
}
