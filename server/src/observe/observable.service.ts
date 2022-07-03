import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ClarityService } from '../external-api/clarity/clarity.service';
import { ObservableQueryResult, ObservablesDefinitions, ObservableDefintion } from './observable.definitions'

@Injectable()
export class ObservableService {
  private readonly logger = new Logger(ObservableService.name)
  private observables: any

  constructor(
    private clarityService: ClarityService,
  ) {
    /** Load observable definitions */
    try {
      this.observables = ObservablesDefinitions
      Object.entries(this.observables).forEach(([type, tree]: [string, ObservableDefintion]) => {
        const name = tree.queryFile ?? `${type}.sql`
        this.observables[type]['query'] = readFileSync(resolve(__dirname, `observables/${name}`)).toString()
      })
    }
    catch (e) {
      this.logger.error(`Error loading observable defintions: ${e}`)
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
}
