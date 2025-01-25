import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeOrmConfig from './config/config.typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
@Module({
  imports: [
    UsersModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
