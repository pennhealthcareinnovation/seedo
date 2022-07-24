import { Injectable, Logger } from '@nestjs/common';
import { observations, faculty, Prisma } from '@prisma/client';
import * as shortUUID from 'short-uuid';
import { differenceInYears, startOfDay, sub } from 'date-fns';

import { MedhubService } from '../external-api/medhub/medhub.service';
import { Procedure, ProcedureLog, VerifyArguments } from '../external-api/medhub/medhub.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(
    private medhubService: MedhubService,
    private prismaService: PrismaService,
  ) { }

  private readonly logger = new Logger(SyncService.name)

  /**
   * Verify a synced observation in Medhub
   * NOTE: only observations with a supervisorId can be verified
   */
  async verifyObservation(observation: observations & { supervisingFaculty: faculty }) {
    if (!observation.supervisingFaculty) {
      throw new Error('Observation must have a supervising faculty to sync to Medhub')
    }

    const request: VerifyArguments = {
      procedureID: parseInt(observation.medhubProcedureId),
      supervisorID: parseInt(observation.supervisingFaculty.medhubUserId),
      status: 1,
    }

    const result = await this.medhubService.request({
      endpoint: 'procedures/verify',
      request
    })

    this.logger.debug(`verified procedure from obs: ${observation.id}, medhubProcedureId: ${observation.medhubProcedureId}`)

    return result
  }

  /**
   * Sync observations to MedHub that are a week old, and have supervisor
   * @returns 
   */
  async syncToMedhub() {
    const observations = await this.prismaService.observations.findMany({
      where: {
        observationDate: { lt: sub(startOfDay(new Date()), { days: 6 }) },
        syncedAt: null,
        supervisingFaculty: {
          isNot: null,
        }
      },
      include: {
        trainee: true,
        supervisingFaculty: true,
        task: {
          include: {
            procedureType: true
          }
        }
      }
    })

    const synced = await Promise.all(observations.map(async obs => {
      /** Create a short UUID to attach to Medhub record for easier lookup */
      obs.medhubPatientId = shortUUID.generate()

      const logParams: ProcedureLog = {
        userID: parseInt(obs.trainee.medhubUserId),
        date: obs.observationDate,
        supervisorID: parseInt(obs?.supervisingFaculty?.medhubUserId),
        fields: {
          patientID: obs.medhubPatientId,
          patient_age: differenceInYears(new Date(), new Date((obs.data as any)?.patientBirthDate)),
          patient_gender: (obs.data as any)?.patientGender,
          notes: "Logged by Seedo"
        }
      }
      const log = await this.medhubService.request({
        endpoint: 'procedures/record',
        request: logParams
      })
      obs.medhubLogId = log.logID.toString()

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
      obs.medhubProcedureId = procedure.procedureID.toString()

      if (obs?.supervisingFaculty) {
        await this.verifyObservation(obs)
      }

      this.logger.debug(`synced observation id: ${obs.id}, medhubProcedureId: ${obs.medhubProcedureId}, medhubLogId: ${obs.medhubLogId}, medhubPatientId: ${obs.medhubPatientId}`)

      return obs
    }))

    const update = await this.prismaService.$transaction(
      synced.map((obs) =>
        this.prismaService.observations.update({
          where: { id: obs.id },
          data: {
            medhubPatientId: obs.medhubPatientId,
            medhubProcedureId: obs.medhubProcedureId,
            medhubLogId: obs.medhubLogId,
            syncedAt: new Date(),
          }
        })
      )
    )

    return update
  }
}
