"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const adminjs_1 = require("adminjs");
const prisma_1 = require("@adminjs/prisma");
const app_controller_1 = require("./app.controller");
const external_api_module_1 = require("./external-api/external-api.module");
const tasks_module_1 = require("./tasks/tasks.module");
const prisma_module_1 = require("./prisma/prisma.module");
const program_module_1 = require("./program/program.module");
const bootstrap_1 = require("./admin/bootstrap");
const observe_module_1 = require("./observe/observe.module");
adminjs_1.default.registerAdapter({ Resource: prisma_1.Resource, Database: prisma_1.Database });
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            external_api_module_1.ExternalApiModule,
            prisma_module_1.PrismaModule,
            bootstrap_1.AdminModuleBootstrap,
            tasks_module_1.TasksModule,
            program_module_1.ProgramModule,
            observe_module_1.ObserveModule
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map