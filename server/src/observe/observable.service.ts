//@ts-nocheck
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaService } from '../prisma/prisma.service';

import { ClarityService } from '../external-api/clarity/clarity.service';
import { ObservableQueryResult, ObservablesDefinitions, ObservableDefintion } from './observable.definitions'
import { LogService } from '../log/log.service';

interface PopulatedObservableDefintion extends ObservableDefintion {
  query?: string
}

@Injectable()
export class ObservableService {
  private observables: Record<string, PopulatedObservableDefintion>

  constructor(
    private clarityService: ClarityService,
    private prismaService: PrismaService,
    private logService: LogService
  ) {
  }

  async run ({ type, args}: { type: string, args: any }) {
    const observable = this.observables?.[type]
    const result = await this.clarityService.query({
      query: observable.query,
      vars: observable.varsFactory(args)
    })
    return result as ObservableQueryResult[]
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
