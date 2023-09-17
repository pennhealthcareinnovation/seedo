import { Injectable, Logger } from '@nestjs/common';
import { observations, faculty, trainees, tasks, procedureTypes } from '@prisma/client';
import * as shortUUID from 'short-uuid';
import { differenceInYears, startOfDay, sub } from 'date-fns';

import { MedhubService } from '../external-api/medhub/medhub.service';
import { Procedure, ProcedureLog, VerifyArguments } from '../external-api/medhub/medhub.types';
import { PrismaService } from '../prisma/prisma.service';
import { setTimeout } from 'timers/promises';
import { ConfigService } from '@nestjs/config';

/** 
 * How long to wait between MedHub API requests
 * that must be performed in series, i.e.:
 * Create Log > Append Procedure > Verify Procedure
 *  */
const SYNC_REQUEST_DELAY_MS = 1 * 1000;

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
  private logger = new Logger(SyncService.name)
  constructor(
    private medhubService: MedhubService,
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) { }

  async syncObservation(obs: fullyPopulatedObservation) {
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
    await setTimeout(SYNC_REQUEST_DELAY_MS)

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
    await setTimeout(SYNC_REQUEST_DELAY_MS)

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

    this.logger.log(`synced/verified observation id: ${obs.id}, medhubProcedureId: ${obs.medhubProcedureId}, medhubLogId: ${obs.medhubLogId}, medhubPatientId: ${obs.medhubPatientId}`, SyncService.name)

    return obs
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

    /**
     * Sync in series to avoid DB consistency issues with MedHub API
     * Break the loop on the first error
     * */
    let synced: observations[] = []
    for (const [i, observation] of observations.entries()) {
      try {
        const syncedObservation = await this.syncObservation(observation)
        const dbUpdate = await this.prismaService.observations.update({
          where: { id: observation.id },
          data: {
            medhubPatientId: syncedObservation.medhubPatientId,
            medhubProcedureId: syncedObservation.medhubProcedureId,
            medhubLogId: syncedObservation.medhubLogId,
            medhubEndpointUrl: this.configService.getOrThrow<string>('MEDHUB_BASE_URL'),
            syncedAt: new Date(),
          }
        })
        synced.push(dbUpdate)
      }

      catch (error) {
        this.logger.error(`
          Stopping sync batch due to error: ${error}
          Sync ${i + 1} of ${observations.length}
          Observation: ${JSON.stringify(observation)}:
        `, SyncService.name)
        break;
      }
    }

    this.logger.log(`updated observation sync data for ${synced.length} observations`, SyncService.name)
    return synced
  }
}
