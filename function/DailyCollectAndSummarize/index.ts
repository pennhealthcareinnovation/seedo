import { NestFactory } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { AzureFunction, Context } from '@azure/functions'
import { ConfigModule } from '@nestjs/config';

import { configuration } from '@seedo/server/config'
import { PrismaModule } from '@seedo/server/prisma/prisma.module'
import { ObserveModule } from '@seedo/server/observe/observe.module'
import { TasksService } from '@seedo/server/observe/tasks.service'
import { SummaryService } from '@seedo/server/observe/summary.service'
import { MailerModule } from '@seedo/server/mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    PrismaModule,
    MailerModule,
    ObserveModule
  ]
})
class AppModule { }

const daily: AzureFunction = async (context: Context, timer: any) => {
  context.log('STARTED FUNCTION')

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] })
  const runTasks = await app.get(TasksService).runAllTasks()
  const sendSummaries = await app.get(SummaryService).sendSummaries()

  context.log('FINISHED FUNCTION')
}

export default daily