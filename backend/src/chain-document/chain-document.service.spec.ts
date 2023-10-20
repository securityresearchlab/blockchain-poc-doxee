import { Test, TestingModule } from '@nestjs/testing';
import { ChainDocumentService } from './chain-document.service';

describe('ChainDocumentService', () => {
  let service: ChainDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChainDocumentService],
    }).compile();

    service = module.get<ChainDocumentService>(ChainDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
