import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Authorization } from '../authorizations/authorizations.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Authorization])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
