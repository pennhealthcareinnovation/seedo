import { DynamicModule, Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AzureContextLogService } from './azureContextLog.service';
import { LogService } from './log.service';

interface LogModuleOptions {
  type?: 'standard' | 'azureContext'

  /** Azure context to log to */
  azureContext?: any
}

@Global()
@Module({
  imports: [ConfigModule],
})
export class LogModule {
  static forRoot({ type, azureContext }: LogModuleOptions): DynamicModule {
    let logService
    if (type == 'azureContext') {
      logService = {
        provide: LogService,
        inject: [ConfigService],
        useFactory: (
          configService: ConfigService,
        ) => {
          return new AzureContextLogService('AzureContext', { azureContext, configService })
        },
      }
    } else {
      logService = { provide: LogService, useClass: LogService }
    }

    return {
      module: LogModule,
      providers: [logService],
      exports: [logService],
    }
  }
}
