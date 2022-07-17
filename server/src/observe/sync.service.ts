import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { differenceInYears, startOfDay, sub } from 'date-fns';

import { MedhubService } from '../external-api/medhub/medhub.service';
import { Procedure, ProcedureLog } from '../external-api/medhub/medhub.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(
    private medhubService: MedhubService,
    private prismaService: PrismaService,
  ) { }

  private readonly logger = new Logger(SyncService.name)

  /**
   * Find observations that are a week old and sync them to Medhub
   * @returns 
   */
  async syncToMedhub() {
    const observations = await this.prismaService.observations.findMany({
      where: {
        observationDate: { lte: sub(startOfDay(new Date()), { days: 6 }) },
        syncedAt: null
      },
      include: {
        trainee: true,
        task: {
          include: {
            procedureType: true
          }
        }
      }
    })

    const synced = await Promise.all(observations.slice(0, 3).map(async obs => {
      /** Create a UUID to attach to Medhub record */
      const medhubPatientId = `seedo-${randomUUID()}`

      const logParams: ProcedureLog = {
        userID: obs.trainee.medhubUserId,
        date: obs.observationDate,
        fields: {
          patientID: medhubPatientId,
          patient_age: differenceInYears(new Date(), new Date((obs.data as any)?.patientBirthDate)),
          patient_gender: (obs.data as any)?.patientGender
        }
      }
      const log = await this.medhubService.request({
        endpoint: 'procedures/record',
        request: logParams
      })
      const medhubLogId = log.logID.toString()

      const procedureParams: Procedure = {
        logID: log.logID,
        typeID: obs.task.procedureType.medhubProcedureTypeId,
        qty: 1,
        role: 1,
      }
      const procedure = await this.medhubService.request({
        endpoint: 'procedures/appendProcedure',
        request: procedureParams
      })
      const medhubProcedureId = procedure.procedureID.toString()

      this.logger.debug(`synced observation id: ${obs.id}, medhubProcedureId: ${medhubProcedureId}, medhubLogId: ${medhubLogId}, medhubPatientId: ${medhubPatientId}`)

      return {
        observationId: obs.id,
        medhubLogId,
        medhubProcedureId,
        medhubPatientId
      }
    }))

    const update = await this.prismaService.$transaction(
      synced.map(({ observationId, medhubLogId, medhubProcedureId, medhubPatientId }) =>
        this.prismaService.observations.update({
          where: { id: observationId },
          data: {
            medhubPatientId,
            medhubProcedureId,
            medhubLogId,
            syncedAt: new Date(),
          }
        })
      )
    )

    return update
  }
}
