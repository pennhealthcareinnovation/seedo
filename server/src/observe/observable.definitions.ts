import type { observations } from '@prisma/client'
import { add, type Duration, startOfDay } from 'date-fns'
import * as mssql from 'mssql'

/** 
 * All queries must implement this interface.
 * Additional column data can be fed into the 'data' JSON
 * column of the observations table.
 */
export type ObservableQueryResult = Omit<
  observations,
  'id'
  | 'traineeId'
  | 'taskId'
  | 'data'
  | 'syncId'
  | 'syncedAt'
  | 'createdAt'
  | 'updatedAt'
> & {
  providerId: string
  providerIdType: string
  supervisorId: string
  supervisorIdType: string
}

export interface varsFactory {
  /** 
   * Duration to *add* to the current date to get starting date;
   * Default is { days: -7 }
   */
  startDateDiff?: Duration

  /** 
   * Duration to add to the current date to get end date; 
   * Default is {}
   * */
  endDateDiff?: Duration
}

export namespace ObservableTypes {
  export interface cardiology_tte_read extends ObservableDefintion {
    patId: string
    orderProcId: string
    procCode: string
    description: string
    finalizingUserId: string
  }
}
export interface ObservableDefintion {
  slug: string

  /** File name for the query, otherwise defautls to <type>.sql */
  queryFile?: string

  displayName: string
  /** Type of identifier for each observation within the EHR (i.e. accession number, note id, etc.) */
  ehrObservationIdType: string
  varsFactory?: (args: any) => any
}

export const ObservablesDefinitions: Record<string, ObservableDefintion> = {
  cardiology_tte_read: {
    slug: 'cardiology_tte_read',
    displayName: 'Transthoracic Echo',
    ehrObservationIdType: 'accession',
    varsFactory: (args: varsFactory) => ([
      { name: 'startDate', type: mssql.DateTime, value: startOfDay(add(new Date(), args?.startDateDiff ?? { days: -7 })) },
      { name: 'endDate', type: mssql.DateTime, value: add(new Date(), args?.endDateDiff ?? {}) }
    ])
  },

  cardiology_exercise_stress_echo: {
    slug: 'cardiology_exercise_stress_echo',
    displayName: 'Exercise Stress Echo',
    ehrObservationIdType: 'accession',
    varsFactory: (args: varsFactory) => ([
      { name: 'startDate', type: mssql.DateTime, value: startOfDay(add(new Date(), args?.startDateDiff ?? { days: -7 })) },
      { name: 'endDate', type: mssql.DateTime, value: add(new Date(), args?.endDateDiff ?? {}) }
    ])
  },

  cardiology_dobutamine_stress_echo: {
    slug: 'cardiology_dobutamine_stress_echo',
    displayName: 'Dobutamine Stress Echo',
    ehrObservationIdType: 'accession',
    varsFactory: (args: varsFactory) => ([
      { name: 'startDate', type: mssql.DateTime, value: startOfDay(add(new Date(), args?.startDateDiff ?? { days: -7 })) },
      { name: 'endDate', type: mssql.DateTime, value: add(new Date(), args?.endDateDiff ?? {}) }
    ])
  },

  cardiology_tee_read: {
    slug: 'cardiology_tee_read',
    displayName: 'Transesophageal Echo',
    ehrObservationIdType: 'accession',
    varsFactory: (args: varsFactory) => ([
      { name: 'startDate', type: mssql.DateTime, value: startOfDay(add(new Date(), args?.startDateDiff ?? { days: -7 })) },
      { name: 'endDate', type: mssql.DateTime, value: add(new Date(), args?.endDateDiff ?? {}) },
    ])
  }
}