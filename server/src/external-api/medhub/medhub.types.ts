export interface ProcedureLog {
  logID?: number
  
  /** The trainee that the procedure log belongs to */
  userID: number

  /** Date the pocedures ocurred on */
  date: Date
  
  /** Supervising clinician for the procedure */
  supervisorID?: number
  programID?: number

  fields: {    
    patientID?: string
    patient_gender?: 'M' | 'F'
    patient_age?: number
    complications?: string
    notes?: string
  }

  procedures?: Procedure[]
}

export interface Procedure {
  logID?: number,
  typeID: number | string,
  role: number,
  qty: number
}

export interface VerifyArguments {
  procedureID: number

  supervisorID: ProcedureLog['supervisorID']

  /** 1: Confirmed, 2: Rejected */
  status: 1 | 2
}

interface MedHubUser {
  userID: string | number
  name_last: string
  name_first: string
  email: string
  username: string
  employeeID: string | number
}

export interface Faculty extends MedHubUser { }

export interface Resident extends MedHubUser {
  typeID: string | number
  level: string | number
  programID: string | number
}