import { Test, TestingModule } from '@nestjs/testing';
import { HealthCkeckController } from './health-ckeck.controller';
import { HealthCkeckService } from './health-ckeck.service';

describe('HealthCkeckController', () => {
  let controller: HealthCkeckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCkeckController],
      providers: [HealthCkeckService],
    }).compile();

    controller = module.get<HealthCkeckController>(HealthCkeckController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
