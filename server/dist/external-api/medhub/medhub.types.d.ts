interface ProcedureLog {
    logID?: number;
    userID: number;
    date: Date;
    supervisorID?: number;
    programID?: number;
    fields: {
        patientID?: string;
        patient_gender?: 'M' | 'F';
        patient_age?: number;
        complications?: string;
        notes?: string;
    };
    procedures?: Procedure[];
}
interface Procedure {
    logID?: number;
    typeID: number;
    role: number;
    quantity: number;
}
