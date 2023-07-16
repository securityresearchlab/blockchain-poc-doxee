import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuthCode } from "../../auth-code/entities/auth-code";
import { SignUpUserDto } from "../dto/signup-user-dto";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
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

    @OneToMany(type => AuthCode, authCode => authCode.user)
    @JoinColumn()
    authCodes: Array<AuthCode>;
}