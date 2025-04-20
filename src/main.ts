import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerGlobal } from './middlewares/middleware.logger';
import { ApiResponse, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { SeederService } from './modules/seeder/seeder.service';
import { ExceptionsFilter } from './config/ExceptionsFilter';
import { ResponseApi } from './config/ResponseApi';
import { log } from 'console';
import * as express from 'express'
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seeder = app.get(SeederService);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(LoggerGlobal);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // para que no tome ninguna prodiedad adicional seteda en el dto
      exceptionFactory: (validate) => {
        // para dar otro tipo de salida a los erores
        const validations = validate.map((validate) => ({
          property: validate.property,
          message: Object.values(validate.constraints)[0],
        }));
        return new BadRequestException(
          new ResponseApi(null, 'Campos incorrectos', validations),
        );
      },
    }),
  ); // se declara para que funcione los dtos
  app.useGlobalFilters(new ExceptionsFilter()); // <---- Filtro global registrado aquí
  app.enableCors({
    origin: ['http://localhost:4200'], // Lista de dominios permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization', // Encabezados permitidos
    credentials: true, // Permitir cookies y credenciales
  });
  app.use('/assets', express.static(join(__dirname, '..', 'assets')));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SICASE')
    .setDescription('BACKEND - SISTEMA DE CUESTIONARIOS DE ASEGURABILIDAD')
    .setVersion('1.0')
    //.addTag('users') // agregar tag a la documentacion
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  //await seeder.seed();

  console.log('Los catalogos fueron registrados correctamente');

  //const port = process.env.PORT || 8300;
  const port = process.env.PORT;

  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
