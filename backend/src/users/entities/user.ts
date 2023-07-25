import { Column, CreateDateColumn, Entity, Generated, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Timestamp, Unique } from "typeorm";
import { AuthCode } from "../../auth-code/entities/auth-code";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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

    @OneToMany(type => AuthCode, authCode => authCode.user)
    @JoinTable()
    authCodes: Array<AuthCode>;
}