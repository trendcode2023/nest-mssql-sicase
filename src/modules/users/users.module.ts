import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [], // Exporting the UsersService to be used in other modules.
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
