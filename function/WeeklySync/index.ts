import { NestFactory } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { AzureFunction, Context } from '@azure/functions'
import { ConfigModule } from '@nestjs/config';

import { configuration } from '@seedo/server/config'
import { PrismaModule } from '@seedo/server/prisma/prisma.module'
import { ObserveModule } from '@seedo/server/observe/observe.module'
import { SyncService } from '@seedo/server/observe/sync.service';
import { LogModule } from '@seedo/server/log/log.module';
import { LogService } from '@seedo/server/log/log.service';


/** Email out weekly summary */
const daily: AzureFunction = async (azureContext: Context, timer: any) => {
  azureContext.log('-- STARTED FUNCTION --')
  @Module({
    imports: [
      LogModule.forRoot({ type: 'azureContext', azureContext }),
      ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
      PrismaModule,
      ObserveModule,
    ]
  })
  class AppModule { }

  const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true })
  app.useLogger(app.get(LogService))

  await app.get(SyncService).syncToMedhub()

  azureContext.log('-- FINISHED FUNCTION --')
}

export default daily