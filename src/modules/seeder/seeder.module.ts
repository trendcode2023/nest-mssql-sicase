import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { Catalog } from '../catalog/catalog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profile/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Catalog, Profile])],
  providers: [SeederService],
})
export class SeederModule {}
