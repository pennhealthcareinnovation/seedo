import { Controller, DefaultValuePipe, Get, Injectable, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { observations, tasks, trainees } from '@prisma/client';
import { sub } from 'date-fns';
import { groupBy, omit } from 'lodash';
import { IsPublicRoute } from '../auth/session.guard';

import { PrismaService } from '../prisma/prisma.service';
import { ParseDatePipe } from '../utilities/parse-date-pipe';
import { type ObservableDefintion, ObservablesDefinitions } from './observable.definitions';
import { ObservableService } from './observable.service';

export type TraineeReportItem = tasks & {
  observations: observations[];
  observableDefinition: Partial<ObservableDefintion>
}

export type TraineeReport = {
  items: TraineeReportItem[]
  trainee: Partial<trainees>
}

@Injectable()
@ApiTags('Observable')
@Controller('observable')
export class ObservableController {
  constructor(
    private observableService: ObservableService,
    private prismaService: PrismaService,
  ) { }

  @IsPublicRoute()
  @Get('tasks')
  async tasks(
    @Query('programId', ParseIntPipe) programId: number
  ) {
    const tasks = await this.prismaService.tasks.findMany({
      where: {
        programId,
      }
    })
    const taskWithDef = tasks.map(task => ({
      ...task,
      observableDefinition: ObservablesDefinitions?.[task.observableType],
    }))
    return taskWithDef
  }

  @IsPublicRoute()
  @Get('observations')
  async traineeReport(
    @Query('traineeId', ParseIntPipe) traineeId: number,
    @Query('type') type: string,
    @Query('startDate', new DefaultValuePipe(sub(new Date(), { months: 3 })), ParseDatePipe) startDate?: Date,
    @Query('endDate', new DefaultValuePipe(new Date()), ParseDatePipe) endDate?: Date,
  ) {
    if (!startDate || !endDate)
      throw Error('startDate and endDate are required')

    const observations = await this.observableService.observationsForTrainee({ traineeId, startDate, endDate, type })
    return observations

  }
}
