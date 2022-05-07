import { Injectable, Logger } from '@nestjs/common';

import { ObservableService } from '../observe/observable.service';
import { ObservablesDefinitions } from '../observe/observables';
import { PrismaService } from '../prisma/prisma.service';
import { ClarityService } from '../external-api/clarity/clarity.service';
import { MedhubService } from '../external-api/medhub/medhub.service';
import { differenceInYears } from 'date-fns';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)
  constructor(
    private clarityService: ClarityService,
    private medhubService: MedhubService,
    private observableService: ObservableService,
    private prismaService: PrismaService,
  ) {}

  async syncObservations() {
    const observations = await this.prismaService.observations.findMany({
      where: { syncId: undefined },
      include: {
        trainee: true,
        task: true
      }
    })

    const synced = await Promise.all(observations.slice(0,5).map(async obs => {
      const log: ProcedureLog = {
        userID: obs.trainee.medhubUserId,
        date: obs.date,
        fields: {
          patientID: obs.patientId,
          patient_age: differenceInYears((obs.data as any)?.patientBirthDate, new Date()),
          patient_gender: (obs.data as any)?.patientGender
        }
      }
      const logResult = await this.medhubService.request({
        endpoint: 'procedures/record',
        request: log
      })

      const procedure: Procedure = {
        logID: logResult.logID,
        typeID: obs.task.medhubProcedureId,
        quantity: 1,
        role: 1
      }
      const appendProcedure = await this.medhubService.request({
        endpoint: 'procedures/appendProcedure',
        request: procedure
      })
      return {
        observationId: obs.id,
        logID: logResult.logID,
        procedureID: appendProcedure.procedureID
      }
    }))

    const update = await this.prismaService.$transaction(
      synced.map(({ observationId, logID, procedureID }) =>
        this.prismaService.observations.update({
          where: { id: observationId },
          data: {
            syncId: procedureID.toString(),
            syncedAt: new Date(),
          }
        })
      )
    )

    return update
  }

  /** Run an assigned task to collect observations for each trainee in a program */
  async runCollectionTask(id: number) {
    const task = await this.prismaService.tasks.findUnique({ 
      where: { id },
      include: {
        program: {
          include: { 
            trainees: {
              include: {
                ehrMetadata: true 
              }
            }
          }
        }
      }
    })

    if (!ObservablesDefinitions?.[task.observableType])
      throw new Error(`Unknown observable type: ${task.observableType}`)

    const trainees = task.program.trainees
    const observables = await this.observableService.run({
      type: task.observableType,
      args: task.args
    })

    /** Create observations */
    trainees.forEach(async trainee => {
      const traineeObs = observables.filter(obs => obs.providerIdentifier === (trainee.ehrMetadata.data as any).user_id)
      const newObservations = traineeObs.map(obs => ({
        type: task.observableType,
        traineeId: trainee.id,
        date: obs.procedureDate,
        patientId: obs.patientIdentifier,
        ehrObservationId: obs.proceedureIdentifier,
        taskId: task.id,
        data: obs as any
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

    return 'OK'
  }
}
