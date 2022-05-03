import { Test, TestingModule } from '@nestjs/testing';
import { MedhubService } from './medhub.service';

describe('MedhubService', () => {
  let service: MedhubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedhubService],
    }).compile();

    service = module.get<MedhubService>(MedhubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
