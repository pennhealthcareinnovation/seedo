import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

import { ObservableService } from './observable.service';

const moduleMocker = new ModuleMocker(global);

describe('ObservableService', () => {
  let service: ObservableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObservableService],
    })
      .useMocker((token) => {
        switch (token) {
          default:
            const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
            const Mock = moduleMocker.generateFromMetadata(mockMetadata);
            return new Mock();
        }
      })
      .compile();

    service = module.get<ObservableService>(ObservableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
