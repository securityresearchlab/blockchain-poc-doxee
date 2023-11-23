import {ApiProperty} from '@nestjs/swagger';
import {IsDate, IsEnum, IsNotEmpty} from 'class-validator';
import {Node} from 'src/blockchain/entities/node';
import {NodeStatusEnum} from 'src/blockchain/entities/node-status-enum';

export class NodeDto {
  @IsNotEmpty()
  nodeId: string;

  @IsNotEmpty()
  @IsDate()
  creationDate: Date;

  @IsNotEmpty()
  memberId: string;

  @IsNotEmpty()
  @IsEnum(NodeStatusEnum)
  @ApiProperty({enum: NodeStatusEnum})
  status: NodeStatusEnum;

  constructor(node: Node) {
    this.nodeId = node.nodeId;
    this.creationDate = node.creationDate;
    this.status = node.status;
    this.memberId = node.memberId;
  }
}
