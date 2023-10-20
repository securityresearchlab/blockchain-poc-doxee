import { Module } from '@nestjs/common';
import { ChainDocumentController } from './chain-document.controller';
import { ChainDocumentService } from './chain-document.service';
import { ChaincodeService } from 'src/blockchain/chiancode.service';

@Module({
  controllers: [ChainDocumentController],
  providers: [ChainDocumentService, ChaincodeService]
})
export class ChainDocumentModule {}
