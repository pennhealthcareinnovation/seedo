import { NestFactory } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { AzureFunction, Context } from '@azure/functions'
import { ConfigModule } from '@nestjs/config';

import { configuration } from '@seedo/server/config'
import { PrismaModule } from '@seedo/server/prisma/prisma.module'
import { ObserveModule } from '@seedo/server/observe/observe.module'
import { AzureContextLogger } from '../common/azureContextLogger';
import { SyncService } from '@seedo/server/observe/sync.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    PrismaModule,
    ObserveModule,
  ]
})
class AppModule { }

/** Email out weekly summary */
const daily: AzureFunction = async (azureContext: Context, timer: any) => {
  azureContext.log('-- STARTED FUNCTION --')

  const app = await NestFactory.createApplicationContext(AppModule, { logger: new AzureContextLogger('FunctionApp', { azureContext }) })
  await app.get(SyncService).syncToMedhub()

  azureContext.log('-- FINISHED FUNCTION --')
}

export default daily