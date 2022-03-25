import { Module } from '@nestjs/common';
import { ExternalApiModule } from 'src/external-api/external-api.module';
import { TasksService } from './tasks.service';

@Module({
  providers: [TasksService],
  exports: [TasksService],
  imports: [ExternalApiModule]
})
export class TasksModule {}
