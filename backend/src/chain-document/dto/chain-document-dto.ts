import {ApiProperty} from '@nestjs/swagger';
import {IsDate, IsNotEmpty} from 'class-validator';
import {ChainDocument} from '../entity/chain-document';

export class ChainDocumentDto {
  @IsNotEmpty()
  @ApiProperty({type: String})
  id: string;

  @IsNotEmpty()
  @ApiProperty({type: String})
  name: string;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({type: Date, example: new Date()})
  uploadDate: Date;

  constructor(partial: Partial<ChainDocument>) {
    Object.assign(this, partial);
  }
}
