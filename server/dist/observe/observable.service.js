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
var ObservableService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservableService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const clarity_service_1 = require("../external-api/clarity/clarity.service");
const observables_1 = require("./observables");
let ObservableService = ObservableService_1 = class ObservableService {
    constructor(clarityService) {
        this.clarityService = clarityService;
        this.logger = new common_1.Logger(ObservableService_1.name);
        try {
            this.observables = observables_1.ObservablesDefinitions;
            Object.entries(this.observables).forEach(([category, tree]) => {
                Object.entries(tree).forEach(([slug, definition]) => {
                    this.observables[category][slug]['query'] = (0, fs_1.readFileSync)((0, path_1.resolve)(__dirname, `observables/${category}/${slug}.sql`)).toString();
                });
            });
        }
        catch (e) {
            this.logger.error(`Error loading observable defintions: ${e}`);
        }
    }
    async run({ category, name, args }) {
        var _a, _b;
        const observable = (_b = (_a = this.observables) === null || _a === void 0 ? void 0 : _a[category]) === null || _b === void 0 ? void 0 : _b[name];
        const result = await this.clarityService.query({
            query: observable.query,
            vars: observable.varsFactory(args)
        });
        return result;
    }
};
ObservableService = ObservableService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clarity_service_1.ClarityService])
], ObservableService);
exports.ObservableService = ObservableService;
//# sourceMappingURL=observable.service.js.map