import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';

export class TransactionDto {
  @IsString()
  @ApiProperty({type: String})
  transactionId: string;

  constructor(transactionId: string) {
    this.transactionId = transactionId;
  }
}
