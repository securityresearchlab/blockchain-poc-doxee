import {Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {User} from '../../users/entities/user';
import {ReasonEnum} from './reason-enum';

@Entity()
export class AuthCode {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne((type) => User, (user) => user.email)
  @JoinTable()
  user: User;

  @Column({enum: ReasonEnum})
  reason: string;

  @Column({length: 8})
  code: string;

  @CreateDateColumn()
  creationDate: Date;

  @Column()
  expirationDate: Date;

  @Column({default: false})
  used: boolean;

  constructor(reason: ReasonEnum) {
    this.reason = reason;
    this.creationDate = new Date();
    this.expirationDate = new Date();
    this.expirationDate.setHours(this.expirationDate.getHours() + 8);
  }
}
