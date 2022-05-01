import { Module } from '@nestjs/common';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';

import { AppController } from './app.controller';
import { ExternalApiModule } from './external-api/external-api.module';
import { TasksModule } from './tasks/tasks.module';
import { ProgramService } from './program/program.service';
import { TraineeService } from './trainee/trainee.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramModule } from './program/program.module';
import { AdminModuleBootstrap } from './admin/bootstrap';

AdminJS.registerAdapter({ Resource, Database })

@Module({
  imports: [
    ExternalApiModule, // PCX, Epic, Clarity
    TasksModule,
    PrismaModule,
    ProgramModule,
    AdminModuleBootstrap    
  ],
  controllers: [AppController],
  providers: [ProgramService, TraineeService],
})
export class AppModule {}
