interface LogPatientProcedure {
    log: ProcedureLog;
    procedures: Procedure[];
}
export declare class MedhubService {
    private readonly logger;
    config: any;
    constructor();
    request({ endpoint, request }: {
        endpoint: string;
        request?: any;
    }): Promise<any>;
    verifcationHash(request: string, ts: number): string;
    logPatientProcedure({ log, procedures }: LogPatientProcedure): void;
    getPrograms(): void;
}
export {};
