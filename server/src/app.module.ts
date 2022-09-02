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
import { UtilitiesModule } from './utilities/utilities.module';
import { ViewModule } from './view/view.module';

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
    UtilitiesModule,

    /** The ViewModule has a catch all * url so it should be loaded last! */
    ViewModule,
    // RenderModule.forRootAsync(Next({ dev: true, dir: './client' }), { viewsDir: './client/pages' }),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class AppModule {}
