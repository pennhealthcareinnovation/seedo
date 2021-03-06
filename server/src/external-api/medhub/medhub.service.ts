import { Injectable, Logger } from '@nestjs/common';
import { getUnixTime } from 'date-fns';
import * as crypto from 'crypto'
import axios from 'axios'
import { ConfigService } from '@nestjs/config';

import type { Procedure, ProcedureLog } from './medhub.types'

interface LogPatientProcedure {
  log: ProcedureLog,
  procedures: Procedure[]
}

@Injectable()
/** Medhub API Service
 * https://api-docs.medhub.com/
 */
export class MedhubService {
  private readonly logger = new Logger(MedhubService.name)

  config!: any

  constructor(
    private configService: ConfigService
  ) {
    this.config = {
      client_id: this.configService.getOrThrow<string>('MEDHUB_CLIENT_ID'),
      private_key: this.configService.getOrThrow<string>('MEDHUB_PRIVATE_KEY'),
      base_url: this.configService.getOrThrow<string>('MEDHUB_BASE_URL')
    }
  }

  async request({ endpoint, request }: { endpoint: string, request?: any }) {
    const ts = getUnixTime(new Date())
    const verify = this.verifcationHash(request, ts)

    const response = await axios.request({
      method: 'POST',
      url: `${this.config.base_url}/functions/api/${endpoint}`,
      data: JSON.stringify({
        clientID: this.config.client_id,
        type: 'json',
        ts,
        verify,
        request
      })
    })

    return response.data
  }

  verifcationHash(request: string, ts: number) {
    /**
     * {clientID}|{timestamp}|{private key}|{request}
     * https://api-docs.medhub.com/#api-requirements
     */
    let verificationString = `${this.config.client_id}|${ts}|${this.config.private_key}|`

    if (request)
      verificationString += JSON.stringify(request)

    return crypto.createHash('sha256').update(verificationString).digest('hex')
  }


  logPatientProcedure({ log, procedures }: LogPatientProcedure) {

  }

  getPrograms() {
    this.request({
      endpoint: 'programs/all'
    })
  }
}
