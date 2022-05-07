import { Module } from '@nestjs/common';

import { ExternalApiModule } from '../external-api/external-api.module';
import { ObservableService } from './observable.service';

@Module({
  providers: [ObservableService],
  imports: [ExternalApiModule],
  exports: [ObservableService],
})
export class ObserveModule {}
