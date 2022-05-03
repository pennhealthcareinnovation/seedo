import { AdminModule } from '@adminjs/nestjs';
import { DMMFClass } from '@prisma/client/runtime';

import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProgramModule } from '../program/program.module';
import { ProgramService } from '../program/program.service';
import { TraineeService } from '../program/trainee.service';

export const AdminModuleBootstrap = AdminModule.createAdminAsync({
  imports: [PrismaModule, ProgramModule],
  inject: [PrismaService, ProgramService, TraineeService],
  useFactory: async (
    prisma: PrismaService,
    programService: ProgramService,
    traineeService: TraineeService
  ) => {
    const dmmf = ((prisma as any)._dmmf as DMMFClass)
    return {
      adminJsOptions: {
        branding: { companyName: 'Seedo' },
        rootPath: '/admin',
        resources: [
          {
            resource: { model: dmmf.modelMap.trainees, client: prisma },
            options: {}
          },
          {
            resource: { model: dmmf.modelMap.programs, client: prisma },
            options: {
              actions: {
                reloadFromMedhub: {
                  label: 'Reload from Medhub',
                  actionType: 'resource',
                  isVisible: true,
                  handler: async () => await programService.reloadPrograms(),
                  component: false,
                  icon: 'Reset'
                },
                loadTraineesFromMedhub: {
                  actionType: 'record',
                  isVisible: true,
                  handler: async (req, res, context) => {
                    const program = context.record.params as any
                    await traineeService.reloadProgramTrainees(program.programID)
                    return { record: context.record.toJSON() }
                  },
                  component: false,
                  icon: 'Reset'
                }
              }
            }
          },
          {
            resource: { model: dmmf.modelMap.observations, client: prisma },
            options: {}
          }
        ]
      }
    }
  }
})