import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Catalog } from '../catalog/catalog.entity';
import { Profile } from '../profile/profile.entity';
import { ProfilesModule } from '../profile/profile.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Catalog, Profile]), ProfilesModule,AuthModule],
  exports: [], // Exporting the UsersService to be used in other modules.
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
