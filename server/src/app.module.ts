import { Module } from '@nestjs/common';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';

import { AppController } from './app.controller';
import { ExternalApiModule } from './external-api/external-api.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramModule } from './program/program.module';
import { AdminModuleBootstrap } from './admin/bootstrap';
import { ObserveModule } from './observe/observe.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { SessionGuard } from './auth/session.guard';

AdminJS.registerAdapter({ Resource, Database })

@Module({
  imports: [
    ExternalApiModule, // PCX, Epic, Clarity
    PrismaModule,
    AdminModuleBootstrap,
    AuthModule,
    
    TasksModule,
    ProgramModule,
    ObserveModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard }
  ],
})
export class AppModule {}
