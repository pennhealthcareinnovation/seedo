export interface ProcedureLog {
  logID?: number
  
  /** The trainee that the procedure log belongs to */
  userID: number | string

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
  quantity: number
}