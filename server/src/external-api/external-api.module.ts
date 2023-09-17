import { Global, Module } from '@nestjs/common';

import { ClarityService } from './clarity/clarity.service';
import { MedhubService } from './medhub/medhub.service';
import { DatabricksService } from './databricks.service';

@Global()
@Module({
  imports: [],
  providers: [ClarityService, MedhubService, DatabricksService],
  exports: [ClarityService, MedhubService, DatabricksService]
})
export class ExternalApiModule {}
