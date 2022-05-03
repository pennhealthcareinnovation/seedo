import { Module } from '@nestjs/common';

import { ExternalApiModule } from '../external-api/external-api.module';
import { ObservableService } from './observable.service';
import { ObservationService } from './/observation.service';

@Module({
  providers: [ObservableService, ObservationService],
  imports: [ExternalApiModule],
  exports: [ObservableService, ObservationService],
})
export class ObserveModule {}
