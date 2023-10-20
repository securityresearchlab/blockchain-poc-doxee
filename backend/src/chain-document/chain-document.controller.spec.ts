import { Test, TestingModule } from '@nestjs/testing';
import { ChainDocumentController } from './chain-document.controller';

describe('ChainDocumentController', () => {
  let controller: ChainDocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChainDocumentController],
    }).compile();

    controller = module.get<ChainDocumentController>(ChainDocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
