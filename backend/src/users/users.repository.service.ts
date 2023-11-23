import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from './entities/user';

@Injectable()
export class UsersRepositoryService {
  private readonly logger = new Logger(UsersRepositoryService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      relations: {
        authCodes: true,
        proposals: true,
        invitations: true,
        members: true,
        nodes: true,
      },
      where: {
        email: email,
      },
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
