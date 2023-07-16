import { Test, TestingModule } from '@nestjs/testing';
import { AuthCodeController } from './auth-code.controller';

describe('AuthCodeController', () => {
  let controller: AuthCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthCodeController],
    }).compile();

    controller = module.get<AuthCodeController>(AuthCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
