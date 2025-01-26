import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])], // Asegúrate de importar la entidad
  providers: [ProfileService], // Registra el servicio
  exports: [ProfileService], // Exporta el servicio para que otros módulos lo utilicen
})
export class ProfilesModule {}
