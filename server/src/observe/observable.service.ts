import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { DatabricksService } from '../external-api/databricks.service';
import { ConfigService } from '@nestjs/config';
import { format, sub } from 'date-fns';
import { ObservableQueryResult } from './observable.definitions';

@Injectable()
export class ObservableService {
  private OBSERVATION_TABLE: string

  constructor(
    private config: ConfigService,
    private prismaService: PrismaService,
    private databricks: DatabricksService
  ) {
    this.OBSERVATION_TABLE = this.config.getOrThrow('DATABRICKS_OBSERVATION_TABLE')
  }

  async collect({ type, lookbackDays }: { type: string, lookbackDays: number }) {
    const endDate = new Date()
    const startDate = sub(new Date(), { days: lookbackDays })
    const query = `
      select * from ${this.OBSERVATION_TABLE}
      where observable_type = '${type}'
      and observationDate between ${format(startDate, 'yyyy-MM-dd')} and ${format(endDate, 'yyyy-MM-dd')}
    `
    return await this.databricks.query(query) as ObservableQueryResult[]
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
