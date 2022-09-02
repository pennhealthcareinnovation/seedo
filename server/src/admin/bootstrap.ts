import { AdminModule, AdminModuleOptions } from '@adminjs/nestjs';
import { DMMFClass } from '@prisma/client/runtime';
import AdminJS, { ActionResponse, CurrentAdmin } from 'adminjs';
import { ExpressLoader } from '@adminjs/nestjs/build/loaders/express.loader';
import { withProtectedRoutesHandler } from '@adminjs/express/lib/authentication/protected-routes.handler';
import { AbstractHttpAdapter } from '@nestjs/core';
import { Router } from 'express';
import { loadPackage } from '@nestjs/common/utils/load-package.util';

import { ObservablesDefinitions } from '../observe/observable.definitions';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProgramModule } from '../program/program.module';
import { ProgramService } from '../program/program.service';
import { TraineeService } from '../program/trainee.service';
import { TasksService } from '../observe/tasks.service';
import { ObserveModule } from '../observe/observe.module';
import { sentEmails } from './resources/sentEmails';

class customLoader extends ExpressLoader {
  register(admin: AdminJS, httpAdapter: AbstractHttpAdapter, options: AdminModuleOptions) {
    const app = httpAdapter.getInstance();
    const router = Router()
    
    /** protect AdminJS routes */
    // withProtectedRoutesHandler(router, admin)
    
    const adminJsExpressJs = loadPackage('@adminjs/express', '@adminjs/nestjs', () => require('@adminjs/express'))
    const adminRouter = adminJsExpressJs.buildRouter(admin, router, options.formidableOptions);
    
    /** mount AdminJS routes */
    app.use(options.adminJsOptions.rootPath, function admin(req, res, next) {
      return adminRouter(req, res, next)
    });

    super.reorderRoutes(app);
  }
}

const medhubUneditableResourceActions = {
  edit: { isAccessible: false, isVisible: false },
  new: { isAccessible: false, isVisible: false },
  delete: { isAccessible: false, isVisible: false },
  bulkDelete: { isAccessible: false, isVisible: false },
}

export const AdminModuleBootstrap = AdminModule.createAdminAsync({
  imports: [PrismaModule, ProgramModule, ObserveModule],
  inject: [PrismaService, ProgramService, TasksService],
  customLoader,
  useFactory: async (
    prisma: PrismaService,
    programService: ProgramService,
    tasksService: TasksService,
  ) => {
    const dmmf = ((prisma as any)._dmmf as DMMFClass)
    return {
      adminJsOptions: {
        branding: { companyName: 'Seedo' },
        rootPath: '/admin',
        logoutPath: '/auth/logout',
        loginPath: '/auth/login',
        resources: [
          sentEmails(prisma),    
          {
            resource: { model: dmmf.modelMap.procedureTypes, client: prisma },
            options: {
              actions: medhubUneditableResourceActions
            }
          },
          {
            resource: { model: dmmf.modelMap.trainees, client: prisma },
            options: {
              actions: medhubUneditableResourceActions
            }
          },
          {
            resource: { model: dmmf.modelMap.faculty, client: prisma },
            options: {
              actions: medhubUneditableResourceActions
            }
          },
          {
            resource: { model: dmmf.modelMap.tasks, client: prisma },
            options: {
              properties: {
                // TOOD: this should dynamically match the program - https://github.com/SoftwareBrothers/adminjs/issues/785
                // medhubProcedureId: {
                //   availableValues: (await prisma.programs.findMany({}))
                //     .flatMap(p => p.procedureTypes)
                //     .map((type: any) => ({ label: type.procedure_name, value: type.typeID }))
                // },
                observableType: {
                  availableValues: Object.values(ObservablesDefinitions).map(obs => ({
                    label: obs.displayName,
                    value: obs.type
                  }))
                },
              },
              actions: {
                runTask: {
                  actionType: 'record',
                  handler: async (req, res, context) => {
                    const task = context.record.params
                    await tasksService.runCollectionTask(task.id)
                    return { record: context.record.toJSON() }
                  },
                  component: false,
                  icon: 'Play'
                },
                // adhocRun: {
                //   actionType: 'record',
                //   handler: async (req, res, context) => {
                //     const task = context.record.params
                //     await tasksService.backfillTasks(task.id)
                //     return { record: context.record.toJSON() }
                //   }
                // }
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
                refreshMedhubData: {
                  actionType: 'record',
                  isVisible: true,
                  handler: async (req, res, context) => {
                    const program = context.record.params as any
                    await programService.reloadProcedureTypes(program.id)
                    await programService.reloadProgramFaculty(program.id)
                    await programService.reloadProgramTrainees(program.id)
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
                    // await tasksService.syncObservations()
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