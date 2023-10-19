import { Module } from '@nestjs/common';

import { ExternalApiModule } from './external-api/external-api.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramModule } from './program/program.module';
import { ObserveModule } from './observe/observe.module';
import { APP_GUARD } from '@nestjs/core';
import { SessionGuard } from './auth/session.guard';
import { MailerModule } from './mailer/mailer.module';
import { azureConfig } from './config';
import { UtilitiesModule } from './utilities/utilities.module';
import { DevController } from './dev/dev.controller';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TasksCommand } from './observe/observe.commands';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [azureConfig], isGlobal: true }),
    ExternalApiModule, // PCX, Epic, Databricks
    PrismaModule,
    // AuthModule,
    MailerModule,

    ProgramModule,
    ObserveModule,
    UtilitiesModule,
    UserModule,

    /** The ViewModule has a catch all * url so it should be loaded last! */
  ],
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
  controllers: [
    DevController
  ]
})
export class AppModule {}

