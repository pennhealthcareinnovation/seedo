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
var ClarityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClarityService = void 0;
const common_1 = require("@nestjs/common");
const mssql_1 = require("mssql");
const lodash_1 = require("lodash");
let ClarityService = ClarityService_1 = class ClarityService {
    constructor() {
        this.logger = new common_1.Logger(ClarityService_1.name);
        const { CLARITY_HOST, CLARITY_DB, CLARITY_USER, CLARITY_PW } = process.env;
        if (!CLARITY_HOST || !CLARITY_DB || !CLARITY_USER || !CLARITY_PW)
            throw Error('CLARITY_ evnironment variables are missing!');
        this.config = {
            server: CLARITY_HOST,
            database: CLARITY_DB,
            user: CLARITY_USER,
            password: CLARITY_PW,
            pool: {
                max: 10,
                min: 0
            },
            options: {
                encrypt: false
            },
            requestTimeout: 180000,
        };
    }
    async query({ query, vars }) {
        this.connectionPool = await (0, mssql_1.connect)(this.config);
        try {
            const request = this.connectionPool.request();
            vars === null || vars === void 0 ? void 0 : vars.forEach(v => request.input(v.name, v.type, v.value));
            const result = await request.query(query);
            return (0, lodash_1.flatten)(result.recordsets);
        }
        catch (e) {
            this.logger.error(e);
        }
    }
    async employeeInfo(userAliases) {
        return await this.query({
            query: `
        select
          user_alias
          ,user_id
        from
          clarity_emp
        where
          user_alias in ('${userAliases.join("','")}')
      `,
            vars: []
        });
    }
};
ClarityService = ClarityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ClarityService);
exports.ClarityService = ClarityService;
//# sourceMappingURL=clarity.service.js.map