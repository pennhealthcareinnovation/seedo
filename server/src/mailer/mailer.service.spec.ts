import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from './mailer.service';

const moduleMocker = new ModuleMocker(global);

const config = () => ({
  'SKIP_EMAILS': 'true',
})

describe('MailerService', () => {
  let service: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config], isGlobal: true })],
      providers: [MailerService],
    })
      .useMocker((token) => {
        switch (token) {
          case PrismaService:
            return {}
          default:
            const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
            const Mock = moduleMocker.generateFromMetadata(mockMetadata);
            return new Mock();
        }
      })
      .compile();

    service = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
