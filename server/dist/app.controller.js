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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const clarity_service_1 = require("./external-api/clarity/clarity.service");
const medhub_service_1 = require("./external-api/medhub/medhub.service");
const tasks_service_1 = require("./tasks/tasks.service");
let AppController = class AppController {
    constructor(clarityService, medhubService, tasksService) {
        this.clarityService = clarityService;
        this.medhubService = medhubService;
        this.tasksService = tasksService;
    }
    getHello() {
        return 'ok';
    }
    async getEchos() {
        const result = await this.tasksService.cardiology();
        return result;
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('cardiology-tasks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getEchos", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [clarity_service_1.ClarityService,
        medhub_service_1.MedhubService,
        tasks_service_1.TasksService])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map