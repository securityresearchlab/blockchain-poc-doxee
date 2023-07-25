import { HttpCode, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from './entities/user';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpUserDto } from './dto/signup-user-dto';
import generateAuthCode from '../auth-code/utils/auth-code-generator';
import { ReasonEnum } from 'src/auth-code/entities/reason-enum';
import { AuthCode } from 'src/auth-code/entities/auth-code';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async findOne(email: string): Promise<User> {
        return this.usersRepository.findOne({
            relations: {
                authCodes: true,
            },
            where: {
                email: email
            }
        });
    }

    async saveOne(signUpUserDto: SignUpUserDto) {
        const existingUser: User = await this.findOne(signUpUserDto.email);
        let user: User = existingUser ? existingUser : new User();
        let authCode = generateAuthCode(ReasonEnum.SIGN_UP);

        // If user already exists then invalidate all existing codes and saving a new one.
        if (existingUser) {
            this.logger.log('Generated code: ' + authCode.code + ' for user: ' + user.id);
            authCode.user = existingUser;
            return await this.usersRepository.manager.transaction(
                async (transactionManager) => {
                    await transactionManager.update(AuthCode, {user: existingUser}, {used: true});
                    await transactionManager.save(authCode);
                }
            )
        }

        user.name = signUpUserDto.name;
        user.surname = signUpUserDto.surname;
        user.organization = signUpUserDto.organization;
        user.email = signUpUserDto.email;
        user.authCodes = new Array();
        
        return await this.usersRepository.manager.transaction(
            async (transactionEntityManger) => {
                authCode.user = await transactionEntityManger.save(user);
                this.logger.log('Generated code: ' + authCode.code + ' for user: ' + user.id);
                await transactionEntityManger.save(authCode);
            }
        );
    }
}
