import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Catalog } from '../catalog/catalog.entity';
import { Profile } from '../profile/profile.entity';
import { ProfilesModule } from '../profile/profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Catalog, Profile]), ProfilesModule],
  exports: [], // Exporting the UsersService to be used in other modules.
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
