import { Injectable } from '@nestjs/common';
import { AuthCode } from './entities/auth-code';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class AuthCodeService {

    constructor(
        @InjectRepository(AuthCode)
        private authCodeRepository: Repository<AuthCode>,
    ) {}

    async findAll(): Promise<Array<AuthCode>> {
        return this.authCodeRepository.find();
    }

    async save(authCode: AuthCode) {
        return this.authCodeRepository.save(authCode);
    }

    async findValidAuthCodeByUser(): Promise<AuthCode[]> {
        return this.authCodeRepository.find({
            relations: {
                user: true,
            },
            where: {
                used: false,
                expireDate: MoreThan(new Date),
            },
        });
    }
}
