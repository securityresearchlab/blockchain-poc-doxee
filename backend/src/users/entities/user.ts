import { Column, CreateDateColumn, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuthCode } from "../../auth-code/entities/auth-code";

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

    @Column({default: null})
    proposalId: string;

    @Column({default: null})
    memberId: string;

    @Column({default: false})
    active: boolean;

    @CreateDateColumn()
    createDate: Date;

    @Column({default: null})
    password: string;

    @OneToMany(type => AuthCode, authCode => authCode.user)
    @JoinTable()
    authCodes: Array<AuthCode>;
}