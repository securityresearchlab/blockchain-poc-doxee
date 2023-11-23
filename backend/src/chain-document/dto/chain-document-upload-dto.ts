import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty} from 'class-validator';

export class ChaindocumentUploadDto {
  @IsNotEmpty()
  @ApiProperty()
  owner: string;

  @IsNotEmpty()
  @ApiProperty({type: 'string', format: 'binary'})
  url: string;
}
