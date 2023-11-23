import {ApiProperty} from '@nestjs/swagger';
import {IsArray, IsNotEmpty, Length, Matches} from 'class-validator';
import {InvitationDto} from './invitation-dto';
import {ProposalDto} from './proposal-dto';
import {User} from '../entities/user';
import {MemberDto} from './member-dto';
import {NodeDto} from './node-dto';

export class UserDto {
  @IsNotEmpty()
  @ApiProperty({example: 'name'})
  name: string;

  @IsNotEmpty()
  @ApiProperty({example: 'surname'})
  surname: string;

  @IsNotEmpty()
  @ApiProperty({example: 'org.example.doxee'})
  organization: string;

  @IsNotEmpty()
  @Length(12, 12)
  @Matches(/^[0-9]{12}$/i)
  @ApiProperty({example: '123456789012'})
  awsClientId: string;

  @IsNotEmpty()
  @Matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)
  @ApiProperty({example: 'email@doxee.com'})
  email: string;

  @IsArray()
  @ApiProperty({type: [ProposalDto], isArray: true})
  proposals: Array<ProposalDto>;

  @IsArray()
  @ApiProperty({type: [InvitationDto], isArray: true})
  invitations: Array<InvitationDto>;

  @IsArray()
  @ApiProperty({type: [MemberDto], isArray: true})
  members: Array<MemberDto>;

  @IsArray()
  @ApiProperty({type: [NodeDto], isArray: true})
  nodes: Array<NodeDto>;

  constructor(user: User) {
    this.name = user.name;
    this.surname = user.surname;
    this.organization = user.organization;
    this.awsClientId = user.awsClientId;
    this.email = user.email;
    this.proposals = user.proposals;
    this.invitations = user.invitations;
    this.members = user.members;
    this.nodes = user.nodes;
  }
}
