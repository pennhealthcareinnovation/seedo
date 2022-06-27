import { Injectable, Logger } from '@nestjs/common';

import { ObservableService } from './observable.service';
import { ObservablesDefinitions } from './observable.definitions';
import { PrismaService } from '../prisma/prisma.service';
import { ClarityService } from '../external-api/clarity/clarity.service';
import { MedhubService } from '../external-api/medhub/medhub.service';
import { differenceInYears } from 'date-fns';

import type { Procedure, ProcedureLog } from '@seedo/server/external-api/medhub/medhub.types'

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)
  constructor(
    private clarityService: ClarityService,
    private medhubService: MedhubService,
    private observableService: ObservableService,
    private prismaService: PrismaService,
  ) { }

  async syncObservations() {
    const observations = await this.prismaService.observations.findMany({
      where: { syncedAt: undefined },
      include: {
        trainee: true,
        task: {
          include: {
            procedureType: true
          }
        }
      }
    })

    const synced = await Promise.all(observations.slice(0, 5).map(async obs => {
      const log: ProcedureLog = {
        userID: obs.trainee.medhubUserId,
        date: obs.observationDate,
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
        typeID: obs.task.procedureType.medhubProcedureTypeId,
        quantity: 1,
        role: 1
      }
      const appendProcedure = await this.medhubService.request({
        endpoint: 'procedures/appendProcedure',
        request: procedure
      })
      return {
        observationId: obs.id,
        medhubLogId: logResult.logID.toString(),
        medhubProcedureId: appendProcedure.procedureID.toString()
      }
    }))

    const update = await this.prismaService.$transaction(
      synced.map(({ observationId, medhubLogId, medhubProcedureId }) =>
        this.prismaService.observations.update({
          where: { id: observationId },
          data: {
            medhubProcedureId,
            medhubLogId, 
            syncedAt: new Date(),
          }
        })
      )
    )

    return update
  }

  async runAllTasks() {
    const tasks = await this.prismaService.tasks.findMany()
    const runTasks = await Promise.all(tasks.map(async task => await this.runCollectionTask(task.id)))
    return runTasks
  }

  /** Run an assigned task to collect observations for each trainee in a program */
  async runCollectionTask(id: number) {
    const task = await this.prismaService.tasks.findUnique({
      where: { id },
      include: {
        program: {
          include: {
            trainees: true
          }
        }
      }
    })
    this.logger.log(`BEGIN TASK - ID: ${task.id}, PROGRAM: ${task.program.name}, OSERVABLE: ${ObservablesDefinitions[task.observableType].displayName}`)

    if (!ObservablesDefinitions?.[task.observableType])
      throw new Error(`Unknown observable type: ${task.observableType}`)

    this.logger.log(`TASK - ID: ${task.id}, BEGIN collection (Clarity query)`)
    const trainees = task.program.trainees
    const observables = await this.observableService.run({
      type: task.observableType,
      args: task.args
    })
    this.logger.log(`TASK - ID: ${task.id}, END collection (Clarity query)`)

    /** Create observations */
    let matchedObservations = 0
    let unqiueTrainees = 0

    trainees.forEach(async trainee => {
      const traineeObs = observables.filter(obs => obs.providerId === trainee.employeeId)
      if (traineeObs.length > 0) {
        unqiueTrainees += 1
        matchedObservations += traineeObs.length
      }

      const newObservations = traineeObs.map(obs => ({
        taskId: task.id,

        traineeId: trainee.id,

        ehrObservationId: obs.ehrObservationId,
        ehrObservationIdType: obs.ehrObservationIdType,

        observationDate: obs.observationDate,

        patientId: obs.patientId,
        patientIdType: obs.patientIdType,
        patientName: obs.patientName,
        patientBirthDate: obs.patientBirthDate,

        data: obs as any
      }))

      await this.prismaService.$transaction(
        newObservations.map(obs =>
          this.prismaService.observations.upsert({
            where: {
              traineeId_ehrObservationId_ehrObservationIdType: {
                traineeId: obs.traineeId,
                ehrObservationId: obs.ehrObservationId,
                ehrObservationIdType: obs.ehrObservationIdType
              }
            },
            create: obs,
            update: obs
          })
        )
      )
    })
    this.logger.log(`TASK - ID: ${task.id}, collected ${matchedObservations} observations for ${unqiueTrainees} trainees.`)
    this.logger.log(`END TASK - ID: ${task.id}, PROGRAM: ${task.program.name}, OSERVABLE: ${ObservablesDefinitions[task.observableType].displayName}`)

    return 'OK'
  }
}
