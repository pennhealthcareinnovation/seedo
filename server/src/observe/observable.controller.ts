import { Controller, DefaultValuePipe, Get, Injectable, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { observations, tasks, trainees } from '@prisma/client';
import { sub } from 'date-fns';
import { groupBy, omit } from 'lodash';
import { IsPublicRoute } from '../auth/session.guard';

import { PrismaService } from '../prisma/prisma.service';
import { ParseDatePipe } from '../utilities/parse-date-pipe';
import { ObservableDefintion, ObservablesDefinitions } from './observable.definitions';
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
  @Get('traineeReport')
  async traineeReport(
    @Query('traineeId', ParseIntPipe) traineeId: number,
    @Query('startDate', new DefaultValuePipe(sub(new Date(), { months: 3 })), ParseDatePipe) startDate?: Date,
    @Query('endDate', new DefaultValuePipe(new Date()), ParseDatePipe) endDate?: Date,
  ) {
    const observations = await this.observableService.observationsForTrainee({ traineeId, startDate, endDate })
    const groupedObservations = groupBy(observations, 'task.observableType')

    const trainee = await this.prismaService.trainees.findUnique({
      where: {
        id: traineeId,
      },
      include: {
        program: {
          include: {
            tasks: true,
          }
        },
      }
    })
    const activeTasks = trainee.program.tasks
    const items = activeTasks.map(task => {
      let item: Partial<TraineeReportItem> = task
      item.observations = groupedObservations[task.observableType] ?? []
      item.observableDefinition = ObservablesDefinitions?.[task.observableType]
      if (item.observableDefinition) {
        item.observableDefinition = omit(item.observableDefinition, ['query', 'varsFactory'])
      }
      return item as TraineeReportItem
    })

    const report: TraineeReport = {
      trainee,
      items,
    }
    return report
  }
}
