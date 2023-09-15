import { User } from "src/users/entities/user";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProposalStatusEnum } from "./proposal-status-enum";

@Entity()
export class Proposal {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    proposalId: string;

    @CreateDateColumn()
    creationDate: Date;

    @Column()
    expirationDate: Date;

    @Column({enum: ProposalStatusEnum})
    status: ProposalStatusEnum;

    @ManyToOne(type => User, user => user.email)
    @JoinTable()
    user: User;

    constructor(proposalAwsObj: any) {
        this.proposalId = proposalAwsObj?.["ProposalId"];
        this.creationDate = new Date(proposalAwsObj?.["CreationDate"]);
        this.expirationDate = new Date(proposalAwsObj?.["ExpirationDate"]);
        this.status = ProposalStatusEnum[proposalAwsObj?.["Status"]];
    }
}