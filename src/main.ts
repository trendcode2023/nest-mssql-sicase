import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerGlobal } from './middlewares/middleware.logger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(LoggerGlobal);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DemoNest')
    .setDescription(
      'esta es una api construida para ser empleada en el modulo 4',
    )
    .setVersion('1.0')
    //.addTag('users') // agregar tag a la documentacion
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
