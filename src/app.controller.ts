import { Controller, Get, Query } from '@nestjs/common';
import { sub } from 'date-fns'

import { ClarityService } from './external-api/clarity/clarity.service';
import { MedhubService } from './external-api/medhub/medhub.service';
import { ProgramService } from './program/program.service';
import { TasksService } from './tasks/tasks.service';
import { TraineeService } from './trainee/trainee.service';

@Controller()
export class AppController {
  constructor(
    private clarityService: ClarityService,
    private medhubService: MedhubService,
    private tasksService: TasksService,
    private programService: ProgramService,
    private traineeService: TraineeService,
  ) {}

  @Get()
  getHello(): string {
    return 'ok'
  }

  @Get('cardiology-tasks')
  async getEchos() {
    const result = await this.tasksService.cardiology()
    return result
  }

  @Get('reload-programs')
  async reloadPrograms() {
    return await this.programService.reloadPrograms()
  }

  @Get('load-program-trainees')
  async loadProgramTrainees(
    @Query('programID') programID: string,
  ) {
    return await this.traineeService.reloadProgramTrainees(programID)
  }
}
