import { Test, TestingModule } from '@nestjs/testing';
import { LooksController } from './looks.controller';

describe('LooksController', () => {
  let controller: LooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LooksController],
    }).compile();

    controller = module.get<LooksController>(LooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
