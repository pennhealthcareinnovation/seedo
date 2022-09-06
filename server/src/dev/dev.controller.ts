import { Controller, Get, Logger, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { TasksService } from '../observe/tasks.service';
import { SummaryService } from '../observe/summary.service';
import { IsPublicRoute } from '../auth/session.guard';
import { SyncService } from '../observe/sync.service';
import { ProgramService } from '../program/program.service';
import { LogService } from '../log/log.service';

@ApiTags('Development')
@Controller('dev')
export class DevController {
  constructor(
    private tasksService: TasksService,
    private summaryService: SummaryService,
    private syncService: SyncService,
    private programService: ProgramService,
    private logService: LogService
  ) {
    this.logService.setContext(DevController.name)
  }

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

  @IsPublicRoute()
  @Get('updatePersonnel')
  async updatePersonnel() {
    /** Update MedHub data for active programs */
    const activePrograms = await this.programService.activePrograms()
    for (const program of activePrograms) {
      this.logService.log(`Reloading MedHub personnel for program: ${program.name}`)
      await this.programService.reloadProgramFaculty(program.id)
      await this.programService.reloadProgramTrainees(program.id)
    }
    this.logService.log('Completed reloading MedHub personnel')
  }

}