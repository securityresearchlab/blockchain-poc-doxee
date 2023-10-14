import { Column, CreateDateColumn, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuthCode } from "../../auth-code/entities/auth-code";
import { Proposal } from "src/blockchain/entities/proposal";
import { Invitation } from "src/blockchain/entities/invitation";
import { Member } from "src/blockchain/entities/member";
import { Node } from "src/blockchain/entities/node";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({length: 12})
    awsClientId: string;

    @Column()
    name: string;

    @Column()
    surname: string;

    @Column()
    organization: string;

    @Column()
    email: string;
    
    @Column({default: false})
    active: boolean;
    
    @CreateDateColumn()
    createDate: Date;
    
    @Column()
    password: string;
    
    @OneToMany(type => AuthCode, authCode => authCode.user)
    @JoinTable()
    authCodes: Array<AuthCode>;
    
    @OneToMany(type => Proposal, proposal => proposal.user)
    @JoinTable()
    proposals: Array<Proposal>;
    
    @OneToMany(type => Invitation, invitation => invitation.user)
    @JoinTable()
    invitations: Array<Invitation>;

    @OneToMany(type => Member, member => member.user)
    @JoinTable()
    members: Array<Member>;

    @OneToMany(type => Node, node => node.user)
    @JoinTable()
    nodes: Array<Node>;
}