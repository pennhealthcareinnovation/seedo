import { Injectable, Logger } from '@nestjs/common';
import { getUnixTime } from 'date-fns';
import * as crypto from 'crypto'
import axios from 'axios'

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

  constructor() {
    const { MEDHUB_CLIENT_ID, MEDHUB_PRIVATE_KEY, MEDHUB_BASE_URL } = process.env
    if (!MEDHUB_CLIENT_ID || !MEDHUB_PRIVATE_KEY || !MEDHUB_BASE_URL)
      this.logger.error('MEDHUB_ environment variables are missing')
    else
      this.config = {
        client_id: MEDHUB_CLIENT_ID,
        private_key: MEDHUB_PRIVATE_KEY,
        base_url: MEDHUB_BASE_URL
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
