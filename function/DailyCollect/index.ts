import { NestFactory } from '@nestjs/core'
import { Logger, Module } from '@nestjs/common'
import { AzureFunction, Context } from '@azure/functions'
import { ConfigModule } from '@nestjs/config';

import { configuration } from '@seedo/server/config'
import { PrismaModule } from '@seedo/server/prisma/prisma.module'
import { ObserveModule } from '@seedo/server/observe/observe.module'
import { TasksService } from '@seedo/server/observe/tasks.service'
import { MailerModule } from '@seedo/server/mailer/mailer.module';
import { ProgramModule } from '@seedo/server/program/program.module';
import { ProgramService } from '@seedo/server/program/program.service';
import { LogModule } from '@seedo/server/log/log.module';
import { LogService } from '@seedo/server/log/log.service';
import { PrismaService } from '@seedo/server/prisma/prisma.service';

/** Run all daily collection tasks */
const daily: AzureFunction = async (azureContext: Context, timer: any) => {
  @Module({
    imports: [
      ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
      LogModule.forRoot({ type: 'azureContext', azureContext }),
      PrismaModule,
      MailerModule,
      ObserveModule,
      ProgramModule
    ]
  })
  class AppModule { }

  azureContext.log('-- STARTED FUNCTION --')

  const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true })
  app.useLogger(app.get(LogService))
  await app.get(PrismaService).enableShutdownHooks(app)
  const logger = app.get(LogService)

  /** Update MedHub data for active programs */
  const programService = app.get(ProgramService)
  const activePrograms = await programService.activePrograms()
  // for (const program of activePrograms) {
  activePrograms.forEach(async program => {
    logger.log(`Reloading MedHub personnel for program: ${program.name}`)
    await programService.reloadProgramFaculty(program.id)
    await programService.reloadProgramTrainees(program.id)
  })

  const tasksService = app.get(TasksService)
  await tasksService.runAllTasks()
  await app.close()

  azureContext.log('-- FINISHED FUNCTION --')
}

export default daily