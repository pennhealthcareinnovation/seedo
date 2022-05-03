import { Injectable, Logger } from '@nestjs/common';
import { connect, config, ConnectionPool, ISqlType, DateTime } from 'mssql'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { flatten, groupBy } from 'lodash';

@Injectable()
export class ClarityService {
  config!: config
  connectionPool!: ConnectionPool
  queries!: any

  private readonly logger = new Logger(ClarityService.name)

  constructor() {
    const { CLARITY_HOST, CLARITY_DB, CLARITY_USER, CLARITY_PW } = process.env
    if (!CLARITY_HOST || !CLARITY_DB || !CLARITY_USER || !CLARITY_PW)
      throw Error('CLARITY_ evnironment variables are missing!')
    
    this.config = {
      server: CLARITY_HOST,
      database: CLARITY_DB,
      user: CLARITY_USER,
      password: CLARITY_PW,
      pool: {
        max: 10,
        min: 0
      },
      options: {
        encrypt: false
      },
      requestTimeout: 180000,
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
      this.logger.error(e)
    }
  }
 
  /**
   * Load employee information from Clarity
   * @param user_alias[] - array of pennIds
   * @returns 
   */
  async employeeInfo (userAliases: string[]) {
    return await this.query({ 
      query: `
        select
          user_alias
          ,user_id
        from
          clarity_emp
        where
          user_alias in ('${userAliases.join("','")}')
      `,
      vars: []
    })
  }

}
