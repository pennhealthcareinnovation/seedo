import { Test, TestingModule } from '@nestjs/testing';
import { ObservableService } from './observable.service';

describe('ObservableService', () => {
  let service: ObservableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObservableService],
    }).compile();

    service = module.get<ObservableService>(ObservableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
