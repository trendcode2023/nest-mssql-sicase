import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { Catalog } from './catalog.entity';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profile/profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([Catalog]), AuthModule, ProfilesModule],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
