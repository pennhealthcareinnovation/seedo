
import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiModule } from '../external-api/external-api.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SyncService } from './sync.service';

describe('SyncService', () => {
  let service: SyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ExternalApiModule,
        PrismaModule
      ],
      providers: [SyncService],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
