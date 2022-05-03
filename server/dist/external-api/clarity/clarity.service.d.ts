import { config, ConnectionPool, ISqlType } from 'mssql';
export declare class ClarityService {
    config: config;
    connectionPool: ConnectionPool;
    queries: any;
    private readonly logger;
    constructor();
    query({ query, vars }: {
        query: string;
        vars?: Array<{
            name: string;
            type: (() => ISqlType) | ISqlType;
            value: any;
        }>;
    }): Promise<any[]>;
    employeeInfo(userAliases: string[]): Promise<any[]>;
}
