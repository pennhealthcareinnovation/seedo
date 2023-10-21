import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaService } from '../prisma/prisma.service';

import { ObservableQueryResult, ObservablesDefinitions, ObservableDefintion } from './observable.definitions'
import { DatabricksService, QueryChunks } from '../external-api/databricks/databricks.service';

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
  private observables: Record<string, PopulatedObservableDefintion>
  private logger = new Logger(ObservableService.name)

  constructor(
    private prismaService: PrismaService,
    private databricks: DatabricksService
  ) {
    /** Load observable definitions */
    try {
      this.observables = ObservablesDefinitions
      Object.entries<ObservableDefintion>(this.observables).forEach(([slug, tree]) => {
        const name = tree.queryFile ?? `${slug}.sql`
        this.observables[slug]['query'] = readFileSync(resolve(__dirname, `observables/${name}`)).toString()
      })
    }
    catch (e) {
      this.logger.error(`Error loading observable defintions: ${e}`)
    }
  }

  /**
   * Create a query string from a template and arguments
   * NOTE: there's implicit trust in the query files
   * Inspiration: https://stackoverflow.com/a/55594573/271868
   * @param observable
   * @param args 
   */
  prepareQuery({ observable, args }: { observable: PopulatedObservableDefintion, args: Record<string, any> }) {
    // remove SQL comments
    let cleanedTemplate = observable.query.replace(/--.*$/gm, '')
    
    // make sure all args are present
    const missingArgs = cleanedTemplate
      .match(/\${(\w+)}/g)?.map(match => match.slice(2, -1))
      .filter(arg => !args[arg])
    if (missingArgs?.length > 0)
      throw Error(`Missing template arguments: ${missingArgs.join(', ')}`)

    // create template function (NOTE: we're placing implicit trust in the query files!)
    const template = (str, obj) => str.replace(/\${(.*?)}/g, (x,g)=> obj[g]);

    // render query template string as template literal 
    const query = template(cleanedTemplate, args)

    return query
  }

  async run ({ slug, args, chunkCallback }: { slug: ObservableDefintion['slug'], args: any, chunkCallback: QueryChunks['chunkCallback'] }) {
    // return this.observables[slug].query
    const observable = this.observables?.[slug]
    if (!observable)
      throw Error(`Observable ${slug} not found`)

    const query = this.prepareQuery({ observable, args })
    await this.databricks.queryChunks({
      queryString: query,
      chunkSize: 5000,
      chunkCallback
    })
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
