import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Authorization } from '../authorizations/authorizations.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Authorization]), AuthModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
