import { Injectable, Logger } from '@nestjs/common';
import { connect, type config, ConnectionPool, type ISqlType, DateTime } from 'mssql'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { flatten, groupBy } from 'lodash';
import { ConfigService } from '@nestjs/config';

import { LogService } from '@seedo/server/log/log.service';

@Injectable()
export class ClarityService {
  config!: config
  connectionPool!: ConnectionPool
  queries!: any

  constructor(
    private configService: ConfigService,
    private logService: LogService
  ) {
    this.config = {
      server: this.configService.getOrThrow<string>('CLARITY_HOST'),
      database: this.configService.getOrThrow<string>('CLARITY_DB'),
      user: this.configService.getOrThrow<string>('CLARITY_USER'),
      password: this.configService.getOrThrow<string>('CLARITY_PW'),
      pool: {
        max: 10,
        min: 0
      },
      options: {
        encrypt: false
      },
      requestTimeout: 600000, // 10 minutes in ms
    }
  }
 
  async query({ query, vars }: { query: string, vars?: Array<{name: string, type: (() => ISqlType) | ISqlType, value: any}>}) {
    this.connectionPool = await connect(this.config)

    try {
      const request = this.connectionPool.request()
      vars?.forEach(v => request.input(v.name, v.type, v.value))
      const result = await request.query(query)
      return flatten(result.recordsets)
    } catch (e) {
      this.logService.error(e, ClarityService.name)
    }
  }

}
