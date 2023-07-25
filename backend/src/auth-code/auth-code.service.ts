import { Injectable } from '@nestjs/common';
import { AuthCode } from './entities/auth-code';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user';

@Injectable()
export class AuthCodeService {

    constructor(
        @InjectRepository(AuthCode)
        private authCodeRepository: Repository<AuthCode>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

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
