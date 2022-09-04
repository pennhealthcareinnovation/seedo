import { DynamicModule, Module } from '@nestjs/common';

import { DevController } from './dev.controller';
import { ConfigurableModuleClass } from './dev.module-definition';

export interface DevModuleOptions {
  /** enable testing routes at /dev */
  enableRoutes?: boolean
}

/**
 * Module for local testing and development
 */
@Module({})
export class DevModule extends ConfigurableModuleClass {
  static forRoot({ enableRoutes }: DevModuleOptions): DynamicModule {
    let controllers = []
    if (enableRoutes)
      controllers.push(DevController)

    return {
      module: DevModule,
      controllers
    }
  }
}
