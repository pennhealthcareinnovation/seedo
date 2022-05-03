"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const observable_service_1 = require("../observe/observable.service");
const prisma_service_1 = require("../prisma/prisma.service");
const clarity_service_1 = require("../external-api/clarity/clarity.service");
const medhub_service_1 = require("../external-api/medhub/medhub.service");
let TasksService = TasksService_1 = class TasksService {
    constructor(clarityService, medhubService, observableService, prismaService) {
        this.clarityService = clarityService;
        this.medhubService = medhubService;
        this.observableService = observableService;
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(TasksService_1.name);
    }
    async cardiology() {
        const program = await this.prismaService.programs.findUnique({
            where: { programID: '166' },
            include: {
                trainees: {
                    include: {
                        ehrMetadata: true,
                    }
                }
            }
        });
        const trainees = program.trainees;
        const echos = await this.observableService.run({
            category: 'cardiology',
            name: 'echos',
            args: {
                startDate: (0, date_fns_1.sub)(new Date(), { days: 7 }),
                endDate: new Date(),
            }
        });
        trainees.forEach(async (trainee) => {
            const traineeEchos = echos.filter(echo => echo.prelimUserId === trainee.ehrMetadata.data.user_id);
            const newObservations = traineeEchos.map(echo => ({
                traineeId: trainee.id,
                type: 'echo',
                date: echo.resultTime,
                patientId: echo.uid,
                ehrObservationId: echo.accessionNum,
                data: echo
            }));
            await this.prismaService.$transaction(newObservations.map(obs => this.prismaService.observations.upsert({
                where: {
                    traineeId_ehrObservationId: {
                        traineeId: obs.traineeId,
                        ehrObservationId: obs.ehrObservationId
                    }
                },
                create: obs,
                update: obs
            })));
        });
        return 'OK';
    }
};
TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clarity_service_1.ClarityService,
        medhub_service_1.MedhubService,
        observable_service_1.ObservableService,
        prisma_service_1.PrismaService])
], TasksService);
exports.TasksService = TasksService;
//# sourceMappingURL=tasks.service.js.map