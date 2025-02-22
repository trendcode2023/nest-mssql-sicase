import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Quest } from './quest.entity';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quest, User])],
  exports: [], // Exporting the UsersService to be used in other modules.
  controllers: [QuestController],
  providers: [QuestService],
})
export class QuestModule {}
