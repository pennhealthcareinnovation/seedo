import { Global, Module } from '@nestjs/common';
import { ClarityService } from './clarity/clarity.service';
import { MedhubService } from './medhub/medhub.service';

@Global()
@Module({
  imports: [],
  providers: [ClarityService, MedhubService],
  exports: [ClarityService, MedhubService]
})
export class ExternalApiModule {}
