import { Module } from '@nestjs/common';
import { ChainDocumentController } from './chain-document.controller';

@Module({
  controllers: [ChainDocumentController]
})
export class ChainDocumentModule {}
