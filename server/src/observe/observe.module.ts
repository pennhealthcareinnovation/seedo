import { Module } from '@nestjs/common';

import { ExternalApiModule } from '../external-api/external-api.module';
import { MailerModule } from '../mailer/mailer.module';
import { ObservableService } from './observable.service';
import { SummaryService } from './summary.service';
import { TasksService } from './tasks.service';
import { SyncService } from './sync.service';
import { ObservableController } from './observable.controller';
import { SummariesCommand, SyncCommand, TasksCommand } from './observe.commands';
import { ProgramModule } from '../program/program.module';

@Module({
  imports: [ExternalApiModule, MailerModule, ProgramModule],
  controllers: [ObservableController],
  providers: [
    ObservableService,
    SummaryService,
    TasksService,
    SyncService,
    ObservableController,

    TasksCommand,
    SummariesCommand,
    SyncCommand
  ],
  exports: [
    ObservableService,
    SummaryService,
    TasksService,
    SyncService,
    ObservableController
  ],
})
export class ObserveModule {}
