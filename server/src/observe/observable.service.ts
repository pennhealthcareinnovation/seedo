import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { ObservableQueryResult, ObservablesDefinitions, ObservableDefintion } from './observable.definitions'

interface PopulatedObservableDefintion extends ObservableDefintion {
  query?: string
}

export interface CollectedObservation {
  observationType: string

  providerId: string
  providerUserId: string
  providerIdType: string  // i.e. pennid

  supervisorId: string
  supervisorUserId: string
  supervisorIdType: string  // i.e. pennid

  ehrObservationId: string
  ehrObservationIdType: string

  observationDate: Date

  patientId: string
  patientIdType: string // i.e. "uid"
  patientName: string
  patientBirthDate: Date
}

@Injectable()
export class ObservableService {
  private OBSERVATION_TABLE: string

  constructor(
    private prismaService: PrismaService,
    private databricks: DatabricksService
  ) {
    this.OBSERVATION_TABLE = this.config.getOrThrow('DATABRICKS_OBSERVATION_TABLE')
  }

  async run ({ type, args}: { type: string, args: any }) {
    throw new Error('Not implemented')
  }

  async syncObservations({ trainee }) {

  }

  async observationsForTrainee({ traineeId, startDate, endDate, type }: { traineeId: number, startDate: Date, endDate: Date, type?: string }) {
    const observations = await this.prismaService.observations.findMany({
      where: {
        traineeId,
        observationDate: {
          gte: startDate,
          lte: endDate
        },
        task: {
          observableType: type
        }
      },
      include: {
        task: true
      }
    })
    return observations
  }
}
