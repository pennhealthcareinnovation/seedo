import { observations } from '@prisma/client'
import { add, Duration, startOfDay } from 'date-fns'
import * as mssql from 'mssql'

export interface ObservableDefintion {
  type: string
  displayName: string
  varsFactory?: (args: any) => string
}

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
}

export interface varsFactory {
  /** 
   * Duration to *add* to the current date to get starting date;
   * Default is { days: -1 }
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

export const ObservablesDefinitions = {
  cardiology_tte_read: {
    type: 'cardiology_tte_read',
    displayName: 'Cardiology - Transthoracic Echo Read',
    varsFactory: (args: varsFactory) => ([
      { name: 'startDate', type: mssql.DateTime, value: startOfDay(add(new Date(), args?.startDateDiff ?? { days: -7 })) },
      { name: 'endDate', type: mssql.DateTime, value: add(new Date(), args?.endDateDiff ?? {}) }
    ])
  }
}