import { Module } from '@nestjs/common';
import { AdminModule } from '@adminjs/nestjs';
import { DMMFClass } from '@prisma/client/runtime';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';

import { AppController } from './app.controller';
import { ExternalApiModule } from './external-api/external-api.module';
import { TasksModule } from './tasks/tasks.module';
import { ProgramService } from './program/program.service';
import { TraineeService } from './trainee/trainee.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

AdminJS.registerAdapter({ Resource, Database })

@Module({
  imports: [
    ExternalApiModule, // PCX, Epic, Clarity
    TasksModule,
    PrismaModule,

    AdminModule.createAdminAsync({
      imports: [PrismaModule],
      inject: [PrismaService],
      useFactory: async (prisma: PrismaService) => {
        const dmmf = ((prisma as any)._dmmf as DMMFClass)
        return {
          adminJsOptions: {
            rootPath: '/admin',
            resources: [
              {
                resource: { model: dmmf.modelMap.trainees, client: prisma },
                options: {}
              },
              {
                resource: { model: dmmf.modelMap.programs, client: prisma },
                options: {}
              }
            ]
          }
        }
      }
    }),

    PrismaModule
  ],
  controllers: [AppController],
  providers: [ProgramService, TraineeService],
})
export class AppModule {}
