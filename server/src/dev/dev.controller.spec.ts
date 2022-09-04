import { Test, TestingModule } from '@nestjs/testing';
import { DevController } from './dev.controller';

describe('AppController', () => {
  let devController: DevController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DevController],
    }).compile();

    devController = app.get<DevController>(DevController);
  });

  describe('root', () => {
  });
});
