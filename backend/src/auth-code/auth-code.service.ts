import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from 'src/users/entities/user';
import {UsersRepositoryService} from 'src/users/users.repository.service';
import {Repository} from 'typeorm';
import {AuthCode} from './entities/auth-code';
import {ReasonEnum} from './entities/reason-enum';
import generateAuthCode from './utils/auth-code-generator';

@Injectable()
export class AuthCodeService {
  private readonly logger = new Logger(AuthCodeService.name);

  constructor(
    @InjectRepository(AuthCode)
    private authCodeRepository: Repository<AuthCode>,
    private usersRepositoryService: UsersRepositoryService,
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
    const response = await this.authCodeRepository
      .createQueryBuilder('authCode')
      .innerJoin('authCode.user', 'user')
      .where('user.id=:id', {id: user.id})
      .andWhere('authCode.code=:code', {code: authCode})
      .andWhere('authCode.expirationDate>:date', {date: new Date()})
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

  async findValidAuthCodeByUser(user: User): Promise<User[]> {
    return (await this.usersRepositoryService.findAll()).filter((u) => u.email == user.email);
  }
}
