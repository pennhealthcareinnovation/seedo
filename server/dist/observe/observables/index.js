"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservablesDefinitions = void 0;
const mssql = require("mssql");
exports.ObservablesDefinitions = {
    cardiology: {
        echos: {
            slug: 'echos',
            displayName: 'Finalized Echos',
            varsFactory: (args) => ([
                { name: 'startDate', type: mssql.DateTime, value: args.startDate },
                { name: 'endDate', type: mssql.DateTime, value: args.endDate }
            ])
        }
    }
};
//# sourceMappingURL=index.js.map