import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { ObservableService } from './observable.service';
import { ObservablesDefinitions } from './observable.definitions';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from '../log/log.service';


@Injectable()
export class TasksService {
  constructor(
    private observableService: ObservableService,
    private prismaService: PrismaService,
    private logService: LogService
  ) {
    this.logService.setContext(TasksService.name)
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
            trainees: true,
            faculty: true
          }
        }
      }
    })
    this.logService.log(`[TASK ${task.id}] BEGIN -- ${task.program.name} // ${ObservablesDefinitions[task.observableType].displayName}`)

    if (!ObservablesDefinitions?.[task.observableType])
      throw new Error(`Unknown observable type: ${task.observableType}`)

    const startTime = process.hrtime()
    const trainees = task.program.trainees
    const observables = await this.observableService.run({
      type: task.observableType,
      args: task.args
    })
    const elapsed = process.hrtime(startTime)
    const elapsedSeconds = (elapsed[0] + elapsed[1] / 1e9).toFixed(3)

    /** Create observations */
    let unqiueTrainees = 0
    let newObservations: Prisma.observationsCreateManyInput[] = []

    trainees.forEach(trainee => {
      const traineeObs = observables.filter(obs => obs.providerId === trainee.employeeId)
      if (traineeObs.length > 0) {
        unqiueTrainees += 1
      }

      newObservations.push(...
        traineeObs.map((obs): Prisma.observationsCreateManyInput => ({
          taskId: task.id,

          traineeId: trainee.id,

          supervisingFacultyId: task.program.faculty.find(f => f.employeeId === obs.supervisorId)?.id,

          ehrObservationId: obs.ehrObservationId,
          ehrObservationIdType: obs.ehrObservationIdType,

          observationDate: obs.observationDate,

          patientId: obs.patientId,
          patientIdType: obs.patientIdType,
          patientName: obs.patientName,
          patientBirthDate: obs.patientBirthDate,

          data: obs as any
        }))
      )
    })

    const transaction = await this.prismaService.$transaction(
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
    this.logService.log(`[TASK ${task.id}] END -- collected ${newObservations.length} observations for ${unqiueTrainees} trainees, collection time: ${elapsedSeconds} seconds`)

    return transaction
  }
}
