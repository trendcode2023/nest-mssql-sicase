import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerGlobal } from './middlewares/middleware.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(LoggerGlobal);
  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
