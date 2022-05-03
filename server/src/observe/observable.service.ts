import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { observable } from 'rxjs';
import { ClarityService } from 'src/external-api/clarity/clarity.service';
import { ObservablesDefinitions } from './observables';

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
      Object.entries(this.observables).forEach(([category, tree]) => {
        Object.entries(tree).forEach(([slug, definition]) => {
          this.observables[category][slug]['query'] = readFileSync(resolve(__dirname, `observables/${category}/${slug}.sql`)).toString()
        })
      })
    }
    catch (e) {
      this.logger.error(`Error loading observable defintions: ${e}`)
    }
  }

  async run<ReturnType> ({ category, name, args}: { category: string, name: string, args: any }) {
    const observable = this.observables?.[category]?.[name]
    const result = await this.clarityService.query({
      query: observable.query,
      vars: observable.varsFactory(args)
    })
    return result as ReturnType[]
  }
}
