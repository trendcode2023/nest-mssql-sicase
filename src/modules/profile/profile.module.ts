import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), AuthModule], // Asegúrate de importar la entidad
  providers: [ProfileService], // Registra el servicio
  controllers: [ProfileController],
  exports: [ProfileService], // Exporta el servicio para que otros módulos lo utilicen
})
export class ProfilesModule {}
