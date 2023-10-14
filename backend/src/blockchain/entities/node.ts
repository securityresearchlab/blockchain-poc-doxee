import { User } from "src/users/entities/user";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NodeStatusEnum } from "./node-status-enum";

@Entity()
export class Node {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    nodeId: string;

    @CreateDateColumn()
    creationDate: Date;

    @Column({enum: NodeStatusEnum})
    status: NodeStatusEnum;

    @Column()
    memberId: string;

    @ManyToOne(type => User, user => user.email)
    @JoinTable()
    user: User; 

    constructor(nodeAwsObj: any, memberId: string) {
        this.nodeId = nodeAwsObj?.["Id"];
        this.status = NodeStatusEnum[nodeAwsObj?.["Status"]];
        this.creationDate = new Date(nodeAwsObj?.["CreationDate"]);
        this.memberId = memberId;
    }
}