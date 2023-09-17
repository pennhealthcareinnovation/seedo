import { Injectable, Logger } from '@nestjs/common';
import { connect, type config, ConnectionPool, type ISqlType, DateTime } from 'mssql'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { flatten, groupBy } from 'lodash';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class ClarityService {
  config!: config
  connectionPool!: ConnectionPool
  queries!: any

  constructor(
    private configService: ConfigService,
  ) {
  }
 
  async query({ query, vars }: { query: string, vars?: Array<{name: string, type: (() => ISqlType) | ISqlType, value: any}>}) {
    throw new Error('Not implemented')
  }

}
