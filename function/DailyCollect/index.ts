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
import { AzureContextLogger } from '../common/azureContextLogger';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    PrismaModule,
    MailerModule,
    ObserveModule
  ]
})
class AppModule { }

/** Run all daily collection tasks */
const daily: AzureFunction = async (azureContext: Context, timer: any) => {
  azureContext.log('-- STARTED FUNCTION --')

  const app = await NestFactory.createApplicationContext(AppModule, { logger: new AzureContextLogger('FunctionApp', { azureContext }) })
  await app.get(TasksService).runAllTasks()

  azureContext.log('-- FINISHED FUNCTION --')
}

export default daily