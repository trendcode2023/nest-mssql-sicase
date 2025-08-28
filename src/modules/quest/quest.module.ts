import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Quest } from './quest.entity';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { User } from '../users/users.entity';
import { Catalog } from '../catalog/catalog.entity';
import { PdfService } from './pdf.service';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profile/profile.module';
import { Profile } from '../profile/profile.entity';
// configuracion de bull
import { BullModule } from '@nestjs/bull';
import { PdfProcessor } from './pdfProcessor';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quest, User, Catalog, Profile]),
    ProfilesModule,
    //nuevo
    UsersModule,
    AuthModule,
    // 🔹 Aquí registras la cola que inyectas en QuestService
    BullModule.registerQueue({
      name: 'pdf-queue',
    }),
  ],
  exports: [], // Exporting the UsersService to be used in other modules.
  controllers: [QuestController],
  providers: [
    QuestService,
    PdfService,
    PdfProcessor, // 🔹 El processor debe estar como provider
  ],
})
export class QuestModule {}
