import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

import { PrismaService } from '@seedo/server/prisma/prisma.service';
import { MedhubService } from './medhub.service';

const moduleMocker = new ModuleMocker(global);

const config = () => ({
  'MEDHUB_CLIENT_ID': 'client_id',
  'MEDHUB_PRIVATE_KEY': 'private_key',
  'MEDHUB_BASE_URL': 'https://localhost/api',
})

describe('MedhubService', () => {
  let service: MedhubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config], isGlobal: true })],
      providers: [MedhubService],
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

    service = module.get<MedhubService>(MedhubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
