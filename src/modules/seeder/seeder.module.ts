import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { Catalog } from '../catalog/catalog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profile/profile.entity';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { Modulo } from '../modulos/modulos.entity';
import { Route } from '../routes/routes.entity';
import { Authorization } from '../authorizations/authorizations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Catalog,
      Profile,
      User,
      Modulo,
      Route,
      Authorization,
    ]),
  ],
  providers: [SeederService, UsersService],
})
export class SeederModule {}
