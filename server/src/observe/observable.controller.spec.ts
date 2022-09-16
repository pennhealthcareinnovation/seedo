import { Test, TestingModule } from '@nestjs/testing';
import { ObservableController } from './observable.controller';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('ObservableController', () => {
  let controller: ObservableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservableController],
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

    controller = module.get<ObservableController>(ObservableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
