import { AdminModule } from '@adminjs/nestjs';
import { DMMFClass } from '@prisma/client/runtime';
import { ActionResponse } from 'adminjs';

import { TasksModule } from '../tasks/tasks.module';
import { ObservablesDefinitions } from '../observe/observables';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProgramModule } from '../program/program.module';
import { ProgramService } from '../program/program.service';
import { TraineeService } from '../program/trainee.service';
import { TasksService } from '../tasks/tasks.service';

export const AdminModuleBootstrap = AdminModule.createAdminAsync({
  imports: [PrismaModule, ProgramModule, TasksModule],
  inject: [PrismaService, ProgramService, TraineeService, TasksService],
  useFactory: async (
    prisma: PrismaService,
    programService: ProgramService,
    traineeService: TraineeService,
    tasksService: TasksService,
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
            resource: { model: dmmf.modelMap.tasks, client: prisma },
            options: {
              properties: {
                // TOOD: this should dynamically match the program - https://github.com/SoftwareBrothers/adminjs/issues/785
                medhubProcedureId: {
                  availableValues: (await prisma.programs.findMany({}))
                    .flatMap(p => p.procedureTypes)
                    .map((type: any) => ({ label: type.procedure_name, value: type.typeID }))
                },
                observableType: {
                  availableValues: Object.values(ObservablesDefinitions).map(obs => ({
                    label: obs.displayName,
                    value: obs.type
                  }))
                }
              },
              actions: {
                runTask: {
                  actionType: 'record',
                  handler: async (req, res, context) => {
                    const task = context.record.params
                    await tasksService.runCollectionTask(task.id)
                    return { record: context.record.toJSON() }
                  }
                }
              }
            },
          },
          {
            resource: { model: dmmf.modelMap.programs, client: prisma },
            options: {
              actions: {
                reloadFromMedhub: {
                  actionType: 'resource',
                  isVisible: true,
                  handler: async (req, res, context): Promise<ActionResponse> => {
                    const programs = await programService.reloadPrograms()
                    return {
                      notice: {
                        type: 'success',
                        message: 'Successfully reloaded programs'
                      },
                      redirectUrl: '/admin/resources/programs',
                    }
                  },
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
            options: {
              actions: {
                edit: {
                  isAccessible: false,
                  isVisible: false
                },
                syncObservations: {
                  actionType: 'resource',
                  component: false,
                  icon: 'Reset',
                  handler: async (req, res, context) => {
                    await tasksService.syncObservations()
                    return {
                      notice: {
                        type: 'success',
                        message: 'Successfully synced observations'
                      },
                      redirectUrl: '/admin/resources/observations',
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  }
})