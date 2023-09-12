import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCodeService } from 'src/auth-code/auth-code.service';
import { AuthCode } from 'src/auth-code/entities/auth-code';
import { ReasonEnum } from 'src/auth-code/entities/reason-enum';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { SignUpUserDto } from './dto/signup-user-dto';
import { User } from './entities/user';
import { SignUpClientDto } from './dto/signup-client-dto';
import { ConfigService } from '@nestjs/config';
import { AppModeEnum } from 'src/config/app-mode-enum';
import { hash } from 'src/auth-code/utils/crypt-and-decrypt';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private blockchainService: BlockchainService,
        private authCodeService: AuthCodeService,
        private mailService: MailService,
        private configService: ConfigService,
    ) {}

    async findOne(email: string): Promise<User> {
        return await this.usersRepository.findOne({
            relations: {
                authCodes: true,
            },
            where: {
                email: email
            }
        });
    }

    /**
     * Main process to register a new user to Doxee platform
     * @param signUpUserDto 
     * @returns 
     */
    async saveOne(signUpUserDto: SignUpUserDto) {
        const existingUser: User = await this.findOne(signUpUserDto.email);
        let user: User = existingUser ? existingUser : new User();

        // If user already exists then generate new auth code and saving a new one.
        if (existingUser) return await this.generateNewAuthCode(existingUser, user);

        // Create new user
        user.name = signUpUserDto.name;
        user.surname = signUpUserDto.surname;
        user.organization = signUpUserDto.organization;
        user.awsClientId = signUpUserDto.awsClientId;
        user.email = signUpUserDto.email;
        user.authCodes = new Array();
        
        return await this.save(user);
    } 

    /**
     * Store new user client applicattion
     * @param singUpClientDto 
     * @returns 
     */
    async saveOneClient(singUpClientDto: SignUpClientDto) {
        const existingUser: User = await this.findOne(singUpClientDto.email);
        let user: User = existingUser ? existingUser : new User();

        // If user already exists then generate new auth code and saving a new one.
        if (existingUser) return await this.generateNewAuthCode(existingUser, user);

        // Create new user
        user.name = singUpClientDto.name;
        user.surname = singUpClientDto.surname;
        user.organization = singUpClientDto.organization;
        user.proposalId = singUpClientDto.proposalId;
        user.awsClientId = this.configService.get("AWS_ACCOUNT_ID")
        user.email = singUpClientDto.email;
        user.password = await hash(singUpClientDto.password);
        user.authCodes = new Array();
         
        return await this.save(user);
    }

    async verifyCodeAndActivate(user: User, authCode: string) {
        return await this.configService.get('APP_MODE') === AppModeEnum.INVITATION ?
            this.verifyCodeAndActivateUser(user, authCode) :
            this.verifyCodeAndGenerateAwsInfrastructure(user, authCode);
    }

    /**
     * Given an existing user and an auth code it invalidate used code and activate user.
     * In this method if user is not active yet a new invitation will be sent to client.
     * @param user 
     * @param authCode 
     * @returns 
     */
    private async verifyCodeAndActivateUser(user: User, authCode: string): Promise<any> {
        return await this.usersRepository.manager.transaction(
            async (transactionManger) => {
                const verify = await this.authCodeService.verifyCode(user, authCode);
                if (verify?.length > 0) {
                    user.proposalId = await this.blockchainService.enrollOrg(user);
                    await transactionManger.update(AuthCode, {user: user}, {used: true});
                    user.active = true;
                    return await transactionManger.save(user);
                } 
                throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
            }
        )
    }

    /**
     * Given an existing user and an auth code if the user is inactive a new member will be registered
     * inside AWS blockchain network
     * @param user 
     * @param authCode 
     * @returns 
     */
    private async verifyCodeAndGenerateAwsInfrastructure(user: User, authCode: string) {
        return await this.usersRepository.manager.transaction(
            async (transactionManger) => {
                const verify = await this.authCodeService.verifyCode(user, authCode);
                if (verify?.length > 0) {
                    await this.blockchainService.generateAwsInfrastructure(user);
                    await transactionManger.update(AuthCode, {user: user}, {used: true});
                    user.active = true;
                    return await transactionManger.save(user);
                } 
                throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
            }
        )
    }

    /**
     * Given an existing user and an auth code it invalidate used code and activate user.
     * In this method if user is not active yet a new organization will be registered in the network.
     * @param user 
     * @param authCode 
     * @returns 
     */
    async verifyCode(user: User, authCode: string): Promise<any> {
        return await this.usersRepository.manager.transaction(
            async (transactionManger) => {
                const verify = await this.authCodeService.verifyCode(user, authCode);
                if (verify?.length > 0) 
                    return await transactionManger.update(AuthCode, {user: user}, {used: true});
                throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
            }
        )
    }

    /**
     * Generates new AuthCode for existing user and sends it via email
     * @param existingUser 
     * @param user 
     * @returns 
     */
    private async generateNewAuthCode(existingUser: User, user: User) {
        return await this.usersRepository.manager.transaction(
            async (transactionManager) => {
                const authCode = await this.authCodeService.generateNewAuthCode(ReasonEnum.SIGN_UP, existingUser);
                user.authCodes.push(authCode);
                await transactionManager.save(user);
                await this.mailService.sendAuthCode(user, authCode.code);
            }
        )
    }


    /**
     * Store user
     * @param user 
     * @returns 
     */
    private async save(user: User) {
        return await this.usersRepository.manager.transaction(
            async (transactionEntityManger) => {
                const savedUser = await transactionEntityManger.save(user);
                const authCode = await this.authCodeService.generateNewAuthCode(ReasonEnum.SIGN_UP, savedUser);
                await transactionEntityManger.save(authCode);
                this.mailService.sendAuthCode(user, authCode.code);
            }
        );
    }
}
