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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraineeService = void 0;
const common_1 = require("@nestjs/common");
const medhub_service_1 = require("../external-api/medhub/medhub.service");
const prisma_service_1 = require("../prisma/prisma.service");
let TraineeService = class TraineeService {
    constructor(medhubService, prismaService) {
        this.medhubService = medhubService;
        this.prismaService = prismaService;
    }
    async reloadProgramTrainees(programID) {
        const trainees = await this.medhubService.request({
            endpoint: `users/residents`,
            request: { programID }
        });
        const newTrainees = trainees.map((trainee) => ({
            medhubUserId: trainee.userID,
            pennId: trainee.employeeID,
            lastName: trainee.name_last,
            firstName: trainee.name_first,
            data: trainee,
            programs: {
                connect: { programID: trainee.programID }
            }
        }));
        await this.prismaService.$transaction(newTrainees.map(trainee => this.prismaService.trainees.upsert({
            where: { medhubUserId: trainee.medhubUserId },
            create: trainee,
            update: trainee
        })));
        return await this.prismaService.trainees.findMany();
    }
};
TraineeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [medhub_service_1.MedhubService,
        prisma_service_1.PrismaService])
], TraineeService);
exports.TraineeService = TraineeService;
//# sourceMappingURL=trainee.service.js.map