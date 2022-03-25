import { Injectable, Logger } from '@nestjs/common';
import { differenceInYears, sub } from 'date-fns';

import { ClarityService } from 'src/external-api/clarity/clarity.service';
import { MedhubService } from 'src/external-api/medhub/medhub.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)
  constructor(
    private clarityService: ClarityService,
    private medhubService: MedhubService
  ) {}

  async cardiology() {
    const trainees = [
      { epicUserId: 'EBERLYL', medhubUserId: 164168 }
    ]

    const echos = await this.clarityService.finalizedEchos({
      startDate: sub(new Date(), { days: 3 }),
      endDate: new Date()
    })

    trainees.forEach(trainee => {
      const traineeEchos = echos.filter(e => e.prelimUserId === trainee.epicUserId)
      
      traineeEchos.slice(0,1).forEach(async echo => {
        const log: ProcedureLog = {
          userID: trainee.medhubUserId,
          date: echo.RESULT_TIME,
          fields: {
            patientID: echo.uid,
            patient_gender: echo.gender,          
            patient_age: differenceInYears(new Date, new Date(echo.BIRTH_DATE))
          }
        }

        const logResult = await this.medhubService.request({
          endpoint: 'procedures/record',
          request: JSON.stringify(log)
        })
        this.logger.debug(`Procedure record: ${logResult}`)

        const procedure: Procedure = {
          logID: logResult.logID,
          typeID: 1796,
          quantity: 1,
          role: 1
        }

        const appendProcedure = await this.medhubService.request({
          endpoint: 'procedures/appendProcedure',
          request: JSON.stringify(procedure)
        })
        this.logger.debug(`Procedure append: ${appendProcedure}`)

      })
    })

    return 'OK'
  }
}
