import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DevModuleOptions } from './dev.module';


export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<DevModuleOptions>().setClassMethodName('forRoot').build();