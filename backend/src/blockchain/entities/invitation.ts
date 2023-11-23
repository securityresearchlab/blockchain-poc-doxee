import {Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {InvitationStatusEnum} from './invitation-status-enum';
import {User} from 'src/users/entities/user';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  invitationId: string;

  @CreateDateColumn()
  creationDate: Date;

  @Column()
  expirationDate: Date;

  @Column({enum: InvitationStatusEnum})
  status: InvitationStatusEnum;

  @ManyToOne((type) => User, (user) => user.email)
  @JoinTable()
  user: User;

  constructor(invitationAwsObj: any) {
    this.invitationId = invitationAwsObj?.['InvitationId'];
    this.creationDate = new Date(invitationAwsObj?.['CreationDate']);
    this.expirationDate = new Date(invitationAwsObj?.['ExpirationDate']);
    this.status = InvitationStatusEnum[invitationAwsObj?.['Status']];
  }
}
