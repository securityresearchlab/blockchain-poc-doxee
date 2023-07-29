import { HttpCode, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from './entities/user';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpUserDto } from './dto/signup-user-dto';
import { ReasonEnum } from 'src/auth-code/entities/reason-enum';
import { AuthCode } from 'src/auth-code/entities/auth-code';
import { MailService } from 'src/mail/mail.service';
import { AuthCodeService } from 'src/auth-code/auth-code.service';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private authCodeService: AuthCodeService,
        private mailService: MailService,
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

        // If user already exists then invalidate all existing codes and saving a new one.
        if (existingUser) {
            return await this.usersRepository.manager.transaction(
                async (transactionManager) => {
                    await transactionManager.update(AuthCode, {user: existingUser}, {used: true});
                    const authCode = await this.authCodeService.generateNewAuthCode(ReasonEnum.SIGN_UP, existingUser);
                    user.authCodes.push(authCode);
                    await transactionManager.save(user);
                    await this.mailService.sendAuthCode(user, authCode.code);
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
                const authCode = await this.authCodeService.generateNewAuthCode(ReasonEnum.SIGN_UP, 
                    await transactionEntityManger.save(user));
                await transactionEntityManger.save(authCode);
                await this.mailService.sendAuthCode(user, authCode.code);
            }
        );
    }

    async verifyCodeAndActivateUser(user: User, authCode: string): Promise<any> {
        return await this.usersRepository.manager.transaction(
            async (transactionManger) => {
                await this.authCodeService.verifyCode(user, authCode);
                await transactionManger.update(AuthCode, {user: user}, {used: true});
                user.active = true;
                await transactionManger.save(user);
            }
        )
    }
}
