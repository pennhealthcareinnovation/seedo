import { Module } from '@nestjs/common';

import { ExternalApiModule } from '../external-api/external-api.module';
import { MailerModule } from '../mailer/mailer.module';
import { ObservableService } from './observable.service';
import { SummaryService } from './summary.service';
import { TasksService } from './tasks.service';
import { SyncService } from './sync.service';
import { ObservableController } from './observable.controller';

@Module({
  providers: [ObservableService, SummaryService, TasksService, SyncService, ObservableController],
  imports: [ExternalApiModule, MailerModule],
  exports: [ObservableService, SummaryService, TasksService, SyncService, ObservableController],
  controllers: [ObservableController],
})
export class ObserveModule {}
