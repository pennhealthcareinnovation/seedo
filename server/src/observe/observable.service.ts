import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaService } from '../prisma/prisma.service';

import { ClarityService } from '../external-api/clarity/clarity.service';
import { ObservableQueryResult, ObservablesDefinitions, ObservableDefintion } from './observable.definitions'
import { LogService } from '../log/log.service';

@Injectable()
export class ObservableService {
  private observables: any

  constructor(
    private clarityService: ClarityService,
    private prismaService: PrismaService,
    private logService: LogService
  ) {
    this.logService.setContext(ObservableService.name)

    /** Load observable definitions */
    try {
      this.observables = ObservablesDefinitions
      Object.entries(this.observables).forEach(([type, tree]: [string, ObservableDefintion]) => {
        const name = tree.queryFile ?? `${type}.sql`
        this.observables[type]['query'] = readFileSync(resolve(__dirname, `observables/${name}`)).toString()
      })
    }
    catch (e) {
      this.logService.error(`Error loading observable defintions: ${e}`)
    }
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

  async observationsForTrainee({ traineeId, startDate, endDate }: { traineeId: number, startDate: Date, endDate: Date }) {
    const observations = await this.prismaService.observations.findMany({
      where: {
        traineeId,
        observationDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        task: true
      }
    })
    return observations
  }
}
