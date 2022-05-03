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

AdminJS.registerAdapter({ Resource, Database })

@Module({
  imports: [
    ExternalApiModule, // PCX, Epic, Clarity
    PrismaModule,
    AdminModuleBootstrap,
    
    TasksModule,
    ProgramModule,
    ObserveModule    
  ],
  controllers: [AppController],
})
export class AppModule {}
