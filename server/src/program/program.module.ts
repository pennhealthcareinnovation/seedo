import { Module } from '@nestjs/common';
import { TraineeService } from './trainee.service';
import { ProgramService } from './program.service';

@Module({
  exports: [ProgramService, TraineeService],
  providers: [ProgramService, TraineeService]
})
export class ProgramModule {}
