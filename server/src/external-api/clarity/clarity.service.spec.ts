import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

import { ClarityService } from './clarity.service';

const moduleMocker = new ModuleMocker(global);

const config = () => ({
  'CLARITY_HOST': 'localhost',
  'CLARITY_DB': 'clarity',
  'CLARITY_USER': 'clarity',
  'CLARITY_PW': 'password',
})

describe('ClarityService', () => {
  let service: ClarityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config], isGlobal: true })],
      providers: [ClarityService],
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

    service = module.get<ClarityService>(ClarityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
