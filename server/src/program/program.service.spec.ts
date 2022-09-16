import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

import { MedhubService } from '../external-api/medhub/medhub.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProgramService } from './program.service';

const moduleMocker = new ModuleMocker(global);

describe('ProgramService', () => {
  let service: ProgramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgramService],
    })
      .useMocker((token) => {
        switch (token) {
          case MedhubService:
            return {}
          case PrismaService:
            return {}
          default:
            const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
            const Mock = moduleMocker.generateFromMetadata(mockMetadata);
            return new Mock();
        }
      })
      .compile();

    service = module.get<ProgramService>(ProgramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
