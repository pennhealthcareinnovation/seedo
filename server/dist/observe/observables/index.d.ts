import * as mssql from 'mssql';
export interface ObservableDefintion {
    slug: string;
    displayName: string;
    varsFactory?: (args: any) => string;
}
export declare namespace ObservableTypes {
    namespace cardiology {
        interface echos {
            patId: string;
            uid: string;
            patName: string;
            abbr: string;
            birthDate: Date;
            orderProcId: string;
            description: string;
            accessionNum: string;
            resultTime: Date;
            finalizingUserId: string;
            prelimUserId: string;
        }
    }
}
export declare const ObservablesDefinitions: {
    cardiology: {
        echos: {
            slug: string;
            displayName: string;
            varsFactory: (args: {
                startDate: Date;
                endDate: Date;
            }) => {
                name: string;
                type: mssql.ISqlTypeFactoryWithNoParams;
                value: Date;
            }[];
        };
    };
};
