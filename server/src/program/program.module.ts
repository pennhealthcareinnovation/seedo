import { Module } from '@nestjs/common';

import { TraineeService } from './trainee.service';
import { ProgramService } from './program.service';
import { TraineeController } from './trainee.controller';

@Module({
  exports: [ProgramService, TraineeService],
  providers: [ProgramService, TraineeService],
  controllers: [TraineeController]
})
export class ProgramModule {}
