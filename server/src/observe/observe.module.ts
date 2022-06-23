import { Module } from '@nestjs/common';

import { ExternalApiModule } from '../external-api/external-api.module';
import { MailerModule } from '../mailer/mailer.module';
import { ObservableService } from './observable.service';
import { SummaryService } from './summary.service';
import { TasksService } from './tasks.service';

@Module({
  providers: [ObservableService, SummaryService, TasksService],
  imports: [ExternalApiModule, MailerModule],
  exports: [ObservableService, SummaryService, TasksService],
})
export class ObserveModule {}
