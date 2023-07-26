import { Injectable } from '@nestjs/common';
import { sub } from 'date-fns';

import { Prisma } from '@prisma/client';
import { CollectedObservation, ObservableService } from './observable.service';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from '../log/log.service';
import { DatabricksService } from '../external-api/databricks/databricks.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  private observationTable: string

  constructor(
    private observableService: ObservableService,
    private prisma: PrismaService,
    private logService: LogService,
    private databricks: DatabricksService,
    private config: ConfigService
  ) {
    this.observationTable = this.config.getOrThrow<string>('DATABRICKS_OBSERVATION_TABLE')
  }

  async runAllTasks() {
    const tasks = await this.prisma.tasks.findMany()
    const runTasks = await Promise.all(tasks.map(async task => await this.runCollectionTask(task.id)))
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
    this.logService.log(`[TASK ${task.id}] BEGIN -- ${task.program.name} // ${task.observableType}`, TasksService.name)

    const startTime = process.hrtime()
    const trainees = task.program.trainees
    let unqiueTrainees = 0
    let newObservations: Prisma.observationsCreateManyInput[] = []
    const currentDate = new Date()

    const queryString = `
      select *
      from ${this.observationTable} 
      where
        observationType = '${task.observableType}'
        and observationDate >= '${(sub(currentDate, { days: lookbackDays ?? 7})).toISOString()}'
        and observationDate <= '${currentDate.toISOString()}'
    `

    await this.databricks.queryChunks({
      queryString,
      chunkSize: 5000,
      chunkCallback: async (chunk: CollectedObservation[]) => {
        /** filter observations retrieved in the current chunk for our trainees */
        trainees.forEach(trainee => {
          const traineeObs = chunk.filter(obs => obs.providerId === trainee.employeeId)
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
        
        /** upsert retrieved observations */
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

    this.logService.log(`[TASK ${task.id}] END -- collected ${newObservations.length} observations for ${unqiueTrainees} trainees, collection time: ${elapsedSeconds} seconds`, TasksService.name)
  }
}
