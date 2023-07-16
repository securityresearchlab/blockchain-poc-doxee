import { Injectable } from '@nestjs/common';
import { User } from './entities/user';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpUserDto } from './dto/signup-user-dto';
import generateAuthCode from '../auth-code/utils/auth-code-generator';
import { ReasonEnum } from 'src/auth-code/entities/reason-enum';
import { AuthCodeService } from 'src/auth-code/auth-code.service';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async findOne(email: string): Promise<User> {
        return this.usersRepository.findOne({
            relations: {
                authCodes: false,
            },
            where: {
                email: email
            }
        });
    }

    async saveOne(signUpUserDto: SignUpUserDto) {
        let user: User = new User();
        let authCode = generateAuthCode(ReasonEnum.SIGN_UP);

        user.name = signUpUserDto.name;
        user.surname = signUpUserDto.surname;
        user.organization = signUpUserDto.organization;
        user.email = signUpUserDto.email;
        user.authCodes = new Array();
        user.authCodes.push(authCode);

        await this.usersRepository.manager.transaction(
            async (transactionEntityManger) => {
                await transactionEntityManger.save(authCode)
                await transactionEntityManger.save(user)
            }
        );
    }
}
