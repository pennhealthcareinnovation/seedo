import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Router } from 'express';

import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Seedo')
    .setDescription('Seedo API')
    .setVersion('1.0.0')
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api', app, document)

  /** Express instance */
  const expressInstance = app.getHttpAdapter().getInstance();
  const baseRouter = Router()

  await app.listen(3000);
}
bootstrap();
