import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Router } from 'express';
import * as session from 'express-session';

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
  
  /** 
   * Initialie session storage 
   * TOOD: For production this should be set to store in a database instead of in memory
   * https://github.com/voxpelli/node-connect-pg-simple
   * */
  expressInstance.use(session({
    secret: 'seedo',
    name: 'seedo-session',
    resave: true,
    saveUninitialized: false,
  }))

  await app.listen(3000);
}
bootstrap();
