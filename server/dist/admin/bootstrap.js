"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModuleBootstrap = void 0;
const nestjs_1 = require("@adminjs/nestjs");
const prisma_module_1 = require("../prisma/prisma.module");
const prisma_service_1 = require("../prisma/prisma.service");
const program_module_1 = require("../program/program.module");
const program_service_1 = require("../program/program.service");
const trainee_service_1 = require("../program/trainee.service");
exports.AdminModuleBootstrap = nestjs_1.AdminModule.createAdminAsync({
    imports: [prisma_module_1.PrismaModule, program_module_1.ProgramModule],
    inject: [prisma_service_1.PrismaService, program_service_1.ProgramService, trainee_service_1.TraineeService],
    useFactory: async (prisma, programService, traineeService) => {
        const dmmf = prisma._dmmf;
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
                                        const program = context.record.params;
                                        await traineeService.reloadProgramTrainees(program.programID);
                                        return { record: context.record.toJSON() };
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
        };
    }
});
//# sourceMappingURL=bootstrap.js.map