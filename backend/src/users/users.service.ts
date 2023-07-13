import { Injectable } from '@nestjs/common';
import { User } from './entities/user';

@Injectable()
export class UsersService {

    async findOne(email: string): Promise<User | undefined> {
        return undefined;
    }
}
