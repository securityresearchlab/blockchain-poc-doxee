import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AuthCode } from './entities/auth-code';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user';
import { ReasonEnum } from './entities/reason-enum';
import generateAuthCode from './utils/auth-code-generator';

@Injectable()
export class AuthCodeService {
    private readonly logger = new Logger(AuthCodeService.name);

    constructor(
        @InjectRepository(AuthCode)
        private authCodeRepository: Repository<AuthCode>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    /**
     * Invalidates all existing auth codes and generates a new valid one
     * @param reason SIGN_UP or LOGIN
     * @param user existing db user
     * @returns the saved auth code
     */
    async generateNewAuthCode(reason: ReasonEnum, user: User) {
        await this.authCodeRepository.update({user: user}, {used: true});
        let authCode = generateAuthCode(reason, user);
        this.logger.log('Generated code: ' + authCode.code + ' for user: ' + authCode.user.id);
        return this.save(authCode);
    }

    /**
     * Given a user and an auth code verify if it's validity
     * @param user existing db user
     * @param authCode code string
     * @returns authCode or generate a Forbidden exception
     */
    async verifyCode(user: User, authCode: string) {
        const response = await this.authCodeRepository.createQueryBuilder("authCode")
            .innerJoin('authCode.user', 'user')
            .where('user.id=:id', {id: user.id})
            .andWhere('authCode.code=:code', {code: authCode})
            .andWhere('authCode.expireDate>:date', {date: new Date()})
            .andWhere('authCode.used=false')
            .getMany();
        
        this.logger.log(JSON.stringify(response));

        return response;
    }

    async findAll(): Promise<Array<AuthCode>> {
        return this.authCodeRepository.find();
    }

    async save(authCode: AuthCode) {
        return this.authCodeRepository.save(authCode);
    }

    async findValidAuthCodeByUser(): Promise<User[]> {
        return this.userRepository.find({
            relations: {
                authCodes: true,
            },
        });
    }
}
