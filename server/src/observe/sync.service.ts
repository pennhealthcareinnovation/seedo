import { Injectable, Logger } from '@nestjs/common';
import { observations, faculty, trainees, tasks, procedureTypes } from '@prisma/client';
import * as shortUUID from 'short-uuid';
import { differenceInYears, startOfDay, sub } from 'date-fns';

import { MedhubService } from '../external-api/medhub/medhub.service';
import { Procedure, ProcedureLog, VerifyArguments } from '../external-api/medhub/medhub.types';
import { PrismaService } from '../prisma/prisma.service';
import { chunk } from 'lodash';
import { setTimeout } from 'timers/promises';
import { ConfigService } from '@nestjs/config';
import { LogService } from '../log/log.service';

/** How many observations to sync concurrently */
const SYNC_BATCH_SIZE = 10;
/** How long to wait between batches */
const SYNC_BATCH_DELAY_SECONDS = 2;

type fullyPopulatedObservation = (
  observations & {
    supervisingFaculty: faculty,
    trainee: trainees,
    task: (tasks & {
      procedureType: procedureTypes
    })
  }
)

@Injectable()
export class SyncService {
  constructor(
    private medhubService: MedhubService,
    private prismaService: PrismaService,
    private configService: ConfigService,
    private logService: LogService
  ) {
    this.logService.setContext(SyncService.name)
  }

  async syncObservation(obs: fullyPopulatedObservation) {
    try {
      /** Create a short UUID to attach to Medhub record for easier lookup */
      obs.medhubPatientId = shortUUID.generate()

      /**
       * Create a MedHub log for the observation
       */
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

      /** 
       * Append procedure the created MedHub log 
       */
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

      /**
       * Verify the procedure with the supervisingFaculty
       */
      const request: VerifyArguments = {
        procedureID: parseInt(obs.medhubProcedureId),
        supervisorID: parseInt(obs.supervisingFaculty.medhubUserId),
        status: 1,
      }
      const verification = await this.medhubService.request({
        endpoint: 'procedures/verify',
        request
      })

      this.logService.log(`synced/verified observation id: ${obs.id}, medhubProcedureId: ${obs.medhubProcedureId}, medhubLogId: ${obs.medhubLogId}, medhubPatientId: ${obs.medhubPatientId}`)

      return obs
    } catch (e) {

      this.logService.error(`error syncing observation id: ${obs.id}: ${e}`)
      return undefined
    }
  }

  /**
   * Sync observations to MedHub that are a week old, and have supervisor
   * @returns 
   */
  async syncToMedhub() {
    /**
     * Fetch observations that:
     * - haven't been synced
     * - are at least a week old from the day of the observation (observationDate)
     * - have a supervisingFaculty populated
     */
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

    /** Sync in batches to avoid overwhelming the MedHub API */
    const batches = chunk(observations, SYNC_BATCH_SIZE)
    let synced: fullyPopulatedObservation[] = []
    for (const batch of batches) {
      const batchResult = await Promise.all(batch.map(obs => this.syncObservation(obs)))
      synced.push(...batchResult)

      this.logService.debug(`waiting ${SYNC_BATCH_DELAY_SECONDS} seconds before next batch of ${SYNC_BATCH_SIZE}`)
      await setTimeout(SYNC_BATCH_DELAY_SECONDS * 1000)
    }

    /** Update all synced observations */
    const update = await this.prismaService.$transaction(
      synced.filter(obs => obs !== undefined)
        .map((obs) => this.prismaService.observations.update({
          where: { id: obs.id },
          data: {
            medhubPatientId: obs.medhubPatientId,
            medhubProcedureId: obs.medhubProcedureId,
            medhubLogId: obs.medhubLogId,
            medhubEndpointUrl: this.configService.getOrThrow<string>('MEDHUB_BASE_URL'),
            syncedAt: new Date(),
          }
        })
      )
    )
    this.logService.debug(`updated observation sync data for ${synced.length} observations`)

    return update
  }
}
