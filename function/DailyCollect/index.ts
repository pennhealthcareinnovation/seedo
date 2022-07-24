import { NestFactory } from '@nestjs/core'
import { Logger, Module } from '@nestjs/common'
import { AzureFunction, Context } from '@azure/functions'
import { ConfigModule } from '@nestjs/config';

import { configuration } from '@seedo/server/config'
import { AzureContextLogger } from '../common/azureContextLogger';
import { PrismaModule } from '@seedo/server/prisma/prisma.module'
import { ObserveModule } from '@seedo/server/observe/observe.module'
import { TasksService } from '@seedo/server/observe/tasks.service'
import { MailerModule } from '@seedo/server/mailer/mailer.module';
import { ProgramModule } from '@seedo/server/program/program.module';
import { ProgramService } from '@seedo/server/program/program.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    PrismaModule,
    MailerModule,
    ObserveModule,
    ProgramModule
  ]
})
class AppModule { }

/** Run all daily collection tasks */
const daily: AzureFunction = async (azureContext: Context, timer: any) => {
  azureContext.log('-- STARTED FUNCTION --')

  const app = await NestFactory.createApplicationContext(AppModule, { logger: new AzureContextLogger('FunctionApp', { azureContext }) })
  const logger = new Logger('DailyCollect')

  /** Update MedHub data for active programs */
  const programService = app.get(ProgramService)
  const activePrograms = await programService.activePrograms()
  activePrograms.forEach(async program => {
    logger.log(`Reloading MedHub personnel for program: ${program.name}`)
    await programService.reloadProgramFaculty(program.id)
    await programService.reloadProgramTrainees(program.id)
  })

  const tasksService = app.get(TasksService)
  await tasksService.runAllTasks()

  azureContext.log('-- FINISHED FUNCTION --')
}

export default daily