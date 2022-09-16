import { Module } from '@nestjs/common';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';

import { ExternalApiModule } from './external-api/external-api.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramModule } from './program/program.module';
import { AdminModuleBootstrap } from './admin/bootstrap';
import { ObserveModule } from './observe/observe.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { SessionGuard } from './auth/session.guard';
import { MailerModule } from './mailer/mailer.module';
import { configuration } from './config';
import { UtilitiesModule } from './utilities/utilities.module';
import { DevController } from './dev/dev.controller';
import { LogModule } from './log/log.module';
import { ConfigModule } from '@nestjs/config';

AdminJS.registerAdapter({ Resource, Database })

let controllers = []
if (process.env?.ENABLE_DEV_ROUTES == 'true') {
  controllers.push(DevController)
}

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    LogModule.forRoot({ type: 'standard' }),
    ExternalApiModule, // PCX, Epic, Clarity
    PrismaModule,
    // AdminModuleBootstrap,
    AuthModule,
    MailerModule,

    ProgramModule,
    ObserveModule,
    UtilitiesModule,

    /** The ViewModule has a catch all * url so it should be loaded last! */
  ],
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
  controllers
})
export class AppModule {}

