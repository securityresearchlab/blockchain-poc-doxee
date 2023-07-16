import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReasonEnum } from "./reason-enum";
import { User } from "../../users/entities/user";

@Entity()
export class AuthCode {
    @PrimaryGeneratedColumn()
    id: string;

    @ManyToOne(type => User, user => user.email)
    @JoinColumn()
    user: User;

    @Column({enum: ReasonEnum})
    reason: string;

    @Column()
    code: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    expireDate: Date;

    @Column({default: false})
    used: boolean;

    constructor(reason: ReasonEnum) {
        this.reason = reason;
        this.createdAt = new Date();
        this.expireDate = new Date();
        this.expireDate.setHours(this.expireDate.getHours() + 8);
    }
}