import { Controller, Get, Query } from '@nestjs/common';

import { TasksService } from './tasks/tasks.service';

@Controller()
export class AppController {
  constructor(
    private tasksService: TasksService,
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
}
