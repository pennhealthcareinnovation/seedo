import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

import { MedhubService } from '../external-api/medhub/medhub.service';
import { TraineeService } from './trainee.service';

const moduleMocker = new ModuleMocker(global);

describe('TraineeService', () => {
  let service: TraineeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TraineeService],
    })
      .useMocker((token) => {
        switch (token) {
          case MedhubService:
            return {}
          default:
            const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
            const Mock = moduleMocker.generateFromMetadata(mockMetadata);
            return new Mock();
        }
      })
      .compile();

    service = module.get<TraineeService>(TraineeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
