import { User } from "src/users/entities/user";
import { Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MemberStatusEnum } from "./member-status-enum";
import { Node } from "./node";

@Entity()
export class Member {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    memberId: string;

    @Column()
    name: string;

    @Column()
    descritpion: string;

    @Column({enum: MemberStatusEnum})
    status: MemberStatusEnum;

    @Column()
    creationDate: Date;

    @Column()
    isOwned: boolean;

    @OneToMany(type => Node, node => node.nodeId)
    @JoinTable()
    nodes: Array<Node>;
    
    @ManyToOne(type => User, user => user.email)
    @JoinTable()
    user: User;

    constructor(memberAwsObj: any) {
        this.memberId = memberAwsObj?.["Id"];
        this.name = memberAwsObj?.["Name"];
        this.descritpion = memberAwsObj?.["Description"];
        this.status = MemberStatusEnum[memberAwsObj?.["Status"]];
        this.creationDate = new Date(memberAwsObj?.["CreationDate"]);
        this.isOwned = new Boolean(memberAwsObj?.["isOwned"]).valueOf();
        this.nodes = new Array<Node>();
    }
}