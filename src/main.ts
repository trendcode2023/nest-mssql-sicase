import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerGlobal } from './middlewares/middleware.logger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { SeederService } from './modules/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seeder = app.get(SeederService);
  app.use(LoggerGlobal);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // para que no tome ninguna prodiedad adicional seteda en el dto
      exceptionFactory: (errors) => {
        // para dar otro tipo de salida a los erores
        const cleanErrors = errors.map((error) => {
          return { property: error.property, constrains: error.constraints };
        });
        return new BadRequestException({
          alert: 'se han detectado los siguientes errores:',
          errors: cleanErrors,
        });
      },
    }),
  ); // se declara para que funcione los dtos

  app.enableCors({
    origin: ['http://localhost:3001'], // Lista de dominios permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization', // Encabezados permitidos
    credentials: true, // Permitir cookies y credenciales
  });

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

  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
