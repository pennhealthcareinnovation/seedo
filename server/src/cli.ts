import { CommandFactory } from 'nest-commander';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('bootstrap')
  await CommandFactory.run(AppModule, logger)
}
bootstrap();

