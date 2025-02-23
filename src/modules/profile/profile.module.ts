import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])], // Asegúrate de importar la entidad
  providers: [ProfileService], // Registra el servicio
  controllers: [ProfileController],
  exports: [ProfileService], // Exporta el servicio para que otros módulos lo utilicen
})
export class ProfilesModule {}
