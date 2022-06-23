import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';

import { TasksService } from './observe/tasks.service';
import { SummaryService } from './observe/summary.service';
import { IsPublicRoute } from './auth/session.guard';
import { ParseDatePipe } from './utilities/parse-date-pipe';

@Controller()
export class AppController {
  constructor(
    private tasksService: TasksService,
    private summaryService: SummaryService
  ) {}

  @Get()
  getHello(): string {
    return 'ok'
  }

  @Get('run-task')
  async getEchos(
    @Query('id') id: number,
  ) {
    const result = await this.tasksService.runCollectionTask(id)
    return result
  }

  @IsPublicRoute()
  @Get('summary')
  async summary(
    @Query('traineeId', ParseIntPipe) traineeId: number,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
  ) {
    const result = await this.summaryService.sendSummaries()
    return result
  }
}
