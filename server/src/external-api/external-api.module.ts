import { Global, Module } from '@nestjs/common';
import { MedhubService } from './medhub/medhub.service';
import { DatabricksService } from './databricks/databricks.service';

@Global()
@Module({
  imports: [],
  providers: [MedhubService, DatabricksService],
  exports: [MedhubService, DatabricksService]
})
export class ExternalApiModule {}
