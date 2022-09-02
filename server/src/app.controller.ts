import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';

import { TasksService } from './observe/tasks.service';
import { SummaryService } from './observe/summary.service';
import { IsPublicRoute } from './auth/session.guard';
import { ParseDatePipe } from './utilities/parse-date-pipe';
import { SyncService } from './observe/sync.service';

@Controller()
export class AppController {
  constructor(
    private tasksService: TasksService,
    private summaryService: SummaryService,
    private syncService: SyncService,
  ) {}

  @IsPublicRoute()
  @Get('run-task')
  async getEchos(
    @Query('id', ParseIntPipe) id: number,
  ) {
    const result = await this.tasksService.runCollectionTask(id)
    return result
  }

  @IsPublicRoute()
  @Get('sendSummaries')
  async summary() {
    const result = await this.summaryService.sendSummaries()
    return result
  }

  @IsPublicRoute()
  @Get('dailyCollect')
  async dailyCollect() {
    const tasks = await this.tasksService.runAllTasks()
    return tasks
  }

  @IsPublicRoute()
  @Get('sendSummaries')
  async sendSummaries() {
    const summaries = await this.summaryService.sendSummaries()
    return summaries
  }

  @IsPublicRoute()
  @Get('syncMedhub')
  async syncMedhub() {
    const sync = await this.syncService.syncToMedhub()
    return sync
  }
}
