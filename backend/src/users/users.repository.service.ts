import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user";
import { Repository } from "typeorm";
import { Node } from "src/blockchain/entities/node";

@Injectable()
export class UsersRepositoryService {
    private readonly logger = new Logger(UsersRepositoryService.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Node)
        private nodeRepository: Repository<Node>,
    ) {}

    async findOne(email: string): Promise<User> {
        return await this.usersRepository.findOne({
            relations: {
                authCodes: true,
                proposals: true,
                invitations: true,
                members: true,
            },
            where: {
                email: email
            }
        }).then(user => {
            user.members?.forEach(async member => {
                member.nodes.push(...await this.nodeRepository.find({where: {memberId: member.memberId}}))
            })
            return user;
        });
    }

    async findAll(): Promise<User[]> {
        return await this.usersRepository.find({
            relations: {
                authCodes: true,
            },
        });
    }

    getManager() {
        return this.usersRepository.manager;
    }
}