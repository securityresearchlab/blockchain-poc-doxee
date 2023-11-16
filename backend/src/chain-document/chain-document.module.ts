import { Module } from '@nestjs/common';
import { ChainDocumentController } from './chain-document.controller';
import { ChainDocumentService } from './chain-document.service';
import { ChaincodeService } from 'src/chain-document/chiancode.service';

@Module({
  controllers: [ChainDocumentController],
  providers: [ChainDocumentService, ChaincodeService]
})
export class ChainDocumentModule {}
