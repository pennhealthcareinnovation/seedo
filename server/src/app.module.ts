import { Logger, Module } from '@nestjs/common';

import { ExternalApiModule } from './external-api/external-api.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramModule } from './program/program.module';
import { ObserveModule } from './observe/observe.module';
import { APP_GUARD } from '@nestjs/core';
import { SessionGuard } from './auth/session.guard';
import { MailerModule } from './mailer/mailer.module';
import { azureConfig } from './config';
import { UtilitiesModule } from './utilities/utilities.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
})
export class AppModule {
  constructor(
    private config: ConfigService
  ) { }

  private logger = new Logger(AppModule.name)

  onModuleInit() {
    this.logger.verbose(this.config.get('REPORT'))
    if (this.config.get('CACHED', undefined)) {
      this.logger.warn(this.config.get('CACHED'))
    }
  }

}

