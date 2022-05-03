import { Test, TestingModule } from '@nestjs/testing';
import { ClarityService } from './clarity.service';

describe('ClarityService', () => {
  let service: ClarityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClarityService],
    }).compile();

    service = module.get<ClarityService>(ClarityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
