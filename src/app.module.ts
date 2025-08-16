import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeOrmConfig from './config/config.typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

import { ProfilesModule } from './modules/profile/profile.module';
import { MenuModule } from './modules/menu/menu.module';
import { QuestModule } from './modules/quest/quest.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { WinstonLoggerModule } from './modules/logger/winston-logger.module';

import { v4 as uuidv4 } from 'uuid';

//import { AuthModule } from './modules/auth/auth.module';
//import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    QuestModule,
    MenuModule,
    ProfilesModule,

    AuthModule,
    UsersModule,
    CatalogModule,
    WinstonLoggerModule,
    ConfigModule.forRoot({
      // configura el módulo de configuración globalmente.
      isGlobal: true, // Hace que la configuración esté disponible en toda la aplicación sin necesidad de importarla en cada módulo.
      load: [typeOrmConfig], // Carga la configuración de TypeORM desde un archivo o función, permitiendo usarla en toda la aplicación para la conexión a la base de datos.
    }),

    //configurar la conexión a la base de datos de manera asíncrona en NestJS
    TypeOrmModule.forRootAsync({
      inject: [ConfigService], //Inyecta el servicio ConfigService, que es responsable de acceder a las configuraciones de la aplicación.
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm'), //La función useFactory es una función de fábrica que obtiene la configuración de TypeORM desde el ConfigService. En este caso, se obtiene la configuración específica bajo la clave 'typeorm' (usualmente configurada en un archivo de configuración o variables de entorno).
    }),
    JwtModule.register({
      // registra el jwt
      global: true,
      signOptions: { expiresIn: '1h' },
      secret: process.env.JWT_SECRET
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
