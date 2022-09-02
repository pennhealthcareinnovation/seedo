import { Test, TestingModule } from '@nestjs/testing';
import { ObservableController } from './observable.controller';

describe('ObservableController', () => {
  let controller: ObservableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservableController],
    }).compile();

    controller = module.get<ObservableController>(ObservableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
