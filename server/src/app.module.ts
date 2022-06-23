import { Module } from '@nestjs/common';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { ExternalApiModule } from './external-api/external-api.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramModule } from './program/program.module';
import { AdminModuleBootstrap } from './admin/bootstrap';
import { ObserveModule } from './observe/observe.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { SessionGuard } from './auth/session.guard';
import { MailerService } from './mailer/mailer.service';
import { MailerModule } from './mailer/mailer.module';
import { configuration } from './config';

AdminJS.registerAdapter({ Resource, Database })

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    ExternalApiModule, // PCX, Epic, Clarity
    PrismaModule,
    AdminModuleBootstrap,
    AuthModule,
    MailerModule,

    ProgramModule,
    ObserveModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class AppModule {}
