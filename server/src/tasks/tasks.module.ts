import { Module } from '@nestjs/common';

import { ObserveModule } from '../observe/observe.module';
import { ExternalApiModule } from '../external-api/external-api.module';
import { TasksService } from './tasks.service';

@Module({
  providers: [TasksService],
  exports: [TasksService],
  imports: [ExternalApiModule, ObserveModule]
})
export class TasksModule {}
