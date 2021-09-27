import { Test, TestingModule } from '@nestjs/testing';
import { LooksService } from './looks.service';

describe('LooksService', () => {
  let service: LooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LooksService],
    }).compile();

    service = module.get<LooksService>(LooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
