import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AuthCode } from './entities/auth-code';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, MoreThan, Repository } from 'typeorm';
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

    generateNewAuthCode(reason: ReasonEnum, user: User) {
        let authCode = generateAuthCode(reason, user);
        this.logger.log('Generated code: ' + authCode.code + ' for user: ' + authCode.user.id);
        return this.save(authCode);
    }

    async verifyCode(user: User, authCode: string) {
        const response = await this.authCodeRepository.createQueryBuilder("authCode")
            .innerJoin('authCode.user', 'user')
            .where('user.id=:id', {id: user.id})
            .andWhere('authCode.code=:code', {code: authCode})
            .andWhere('authCode.expireDate>:date', {date: new Date()})
            .andWhere('authCode.used=false')
            .getMany();
        
        this.logger.log(JSON.stringify(response));

        if(response) return response;
        
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
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
