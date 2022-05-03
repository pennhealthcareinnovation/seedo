import { Controller, Get, Query } from '@nestjs/common';
import { sub } from 'date-fns'

import { ClarityService } from './external-api/clarity/clarity.service';
import { MedhubService } from './external-api/medhub/medhub.service';
import { TasksService } from './tasks/tasks.service';

@Controller()
export class AppController {
  constructor(
    private clarityService: ClarityService,
    private medhubService: MedhubService,
    private tasksService: TasksService,
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
}
