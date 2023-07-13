import { Test, TestingModule } from '@nestjs/testing';
import { HealthCkeckService } from './health-ckeck.service';

describe('HealthCkeckService', () => {
  let service: HealthCkeckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthCkeckService],
    }).compile();

    service = module.get<HealthCkeckService>(HealthCkeckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
