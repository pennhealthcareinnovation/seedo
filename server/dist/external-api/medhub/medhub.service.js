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
var MedhubService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedhubService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const crypto = require("crypto");
const axios_1 = require("axios");
let MedhubService = MedhubService_1 = class MedhubService {
    constructor() {
        this.logger = new common_1.Logger(MedhubService_1.name);
        const { MEDHUB_CLIENT_ID, MEDHUB_PRIVATE_KEY, MEDHUB_BASE_URL } = process.env;
        if (!MEDHUB_CLIENT_ID || !MEDHUB_PRIVATE_KEY || !MEDHUB_BASE_URL)
            this.logger.error('MEDHUB_ environment variables are missing');
        else
            this.config = {
                client_id: MEDHUB_CLIENT_ID,
                private_key: MEDHUB_PRIVATE_KEY,
                base_url: MEDHUB_BASE_URL
            };
    }
    async request({ endpoint, request }) {
        const ts = (0, date_fns_1.getUnixTime)(new Date());
        const verify = this.verifcationHash(request, ts);
        const response = await axios_1.default.request({
            method: 'POST',
            url: `${this.config.base_url}/functions/api/${endpoint}`,
            data: JSON.stringify({
                clientID: this.config.client_id,
                type: 'json',
                ts,
                verify,
                request
            })
        });
        return response.data;
    }
    verifcationHash(request, ts) {
        let verificationString = `${this.config.client_id}|${ts}|${this.config.private_key}|`;
        if (request)
            verificationString += JSON.stringify(request);
        return crypto.createHash('sha256').update(verificationString).digest('hex');
    }
    logPatientProcedure({ log, procedures }) {
    }
    getPrograms() {
        this.request({
            endpoint: 'programs/all'
        });
    }
};
MedhubService = MedhubService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MedhubService);
exports.MedhubService = MedhubService;
//# sourceMappingURL=medhub.service.js.map