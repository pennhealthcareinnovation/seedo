import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CollectedObservation, ObservableService } from './observable.service';
import { PrismaService } from '../prisma/prisma.service';
import { ObservablesDefinitions } from './observable.definitions';
import { format, sub } from 'date-fns';

@Injectable()
export class TasksService {
  constructor(
    private observableService: ObservableService,
    private prisma: PrismaService,
  ) {}

  private logger = new Logger(TasksService.name)

  async runAllTasks({ lookbackDays = 7 }) {
    const tasks = await this.prisma.tasks.findMany()
    const runTasks = await Promise.all(tasks.map(async task => await this.runCollectionTask(task.id, lookbackDays)))
    return runTasks
  }

  /** Run an assigned task to collect observations for each trainee in a program */
  async runCollectionTask(id: number, lookbackDays: number = 7) {
    const task = await this.prisma.tasks.findUniqueOrThrow({
      where: { id },
      include: {
        program: {
          include: {
            trainees: { where: { active: true } },
            faculty: true
          }
        }
      }
    })
    this.logger.log(`[TASK ${task.id}] BEGIN -- ${task.program.name} // ${ObservablesDefinitions[task.observableType].displayName} [lookbackDays: ${lookbackDays}]`)

    if (!ObservablesDefinitions?.[task.observableType])
      throw new Error(`Unknown observable type: ${task.observableType}`)

    const startTime = process.hrtime()
    const trainees = task.program.trainees
    let unqiueTrainees = 0
    let newObservations: Prisma.observationsCreateManyInput[] = []

    const observables = await this.observableService.run({
      slug: task.observableType,
      args: { 
        start_date: format(sub(new Date(), { days: lookbackDays }), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd')
      },
      chunkCallback: async (rows: CollectedObservation[]) => {
        /** Create observations */
        trainees.forEach(trainee => {
          const traineeObs = rows.filter(obs => obs.providerId === trainee.employeeId)
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
    
        const transaction = await this.prisma.$transaction(
          newObservations.map(obs =>
            this.prisma.observations.upsert({
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
      }
    })
    const elapsed = process.hrtime(startTime)
    const elapsedSeconds = (elapsed[0] + elapsed[1] / 1e9).toFixed(3)
    
    this.logger.log(`[TASK ${task.id}] END -- collected ${newObservations.length} observations for ${unqiueTrainees} trainees, collection time: ${elapsedSeconds} seconds`)

  }
}
