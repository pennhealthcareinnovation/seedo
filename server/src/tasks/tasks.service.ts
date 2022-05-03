import { Injectable, Logger } from '@nestjs/common';
import { differenceInYears, sub } from 'date-fns';

import { ObservableService } from '../observe/observable.service';
import { ObservableTypes } from '../observe/observables';
import { PrismaService } from '../prisma/prisma.service';
import { ClarityService } from '../external-api/clarity/clarity.service';
import { MedhubService } from '../external-api/medhub/medhub.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)
  constructor(
    private clarityService: ClarityService,
    private medhubService: MedhubService,
    private observableService: ObservableService,
    private prismaService: PrismaService,
  ) {}

  async cardiology() {
    const program = await this.prismaService.programs.findUnique({ 
      where: { programID: '166' },
      include: {
        trainees: {
          include: {
            ehrMetadata: true,
          }
        }
      }
    })
    const trainees = program.trainees

    const echos = await this.observableService.run<ObservableTypes.cardiology.echos>({
      category: 'cardiology',
      name: 'echos',
      args: {
        startDate: sub(new Date(), { days: 7 }),
        endDate: new Date(),
      }
    })

    /** Create observations */
    trainees.forEach(async trainee => {
      const traineeEchos = echos.filter(echo => echo.prelimUserId === (trainee.ehrMetadata.data as any).user_id)
      const newObservations = traineeEchos.map(echo => ({
        traineeId: trainee.id,
        type: 'echo',
        date: echo.resultTime,
        patientId: echo.uid,
        ehrObservationId: echo.accessionNum,
        data: echo as any
      }))

      await this.prismaService.$transaction(
        newObservations.map(obs =>
          this.prismaService.observations.upsert({
            where: {
              traineeId_ehrObservationId: {
                traineeId: obs.traineeId,
                ehrObservationId: obs.ehrObservationId
              }
            },
            create: obs,
            update: obs
          })
        )
      )
    })

    // trainees.forEach(trainee => {
    //   const traineeEchos = echos.filter(e => e.prelimUserId === trainee.epicUserId)
      
      // traineeEchos.slice(0,1).forEach(async echo => {
      //   const log: ProcedureLog = {
      //     userID: trainee.medhubUserId,
      //     date: echo.RESULT_TIME,
      //     fields: {
      //       patientID: echo.uid,
      //       patient_gender: echo.gender,          
      //       patient_age: differenceInYears(new Date, new Date(echo.BIRTH_DATE))
      //     }
      //   }

      //   const logResult = await this.medhubService.request({
      //     endpoint: 'procedures/record',
      //     request: JSON.stringify(log)
      //   })
      //   this.logger.debug(`Procedure record: ${logResult}`)

      //   const procedure: Procedure = {
      //     logID: logResult.logID,
      //     typeID: 1796,
      //     quantity: 1,
      //     role: 1
      //   }

      //   const appendProcedure = await this.medhubService.request({
      //     endpoint: 'procedures/appendProcedure',
      //     request: JSON.stringify(procedure)
      //   })
      //   this.logger.debug(`Procedure append: ${appendProcedure}`)

      // })
    // })

    return 'OK'
  }
}
