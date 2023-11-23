import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {AuthCodeService} from 'src/auth-code/auth-code.service';
import {ReasonEnum} from 'src/auth-code/entities/reason-enum';
import {isMatch} from 'src/auth-code/utils/crypt-and-decrypt';
import {MailService} from 'src/mail/mail.service';
import {LoginUserDto} from 'src/users/dto/login-user-dto';
import {UsersRepositoryService} from 'src/users/users.repository.service';
import {UsersService} from 'src/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private usersRepositoryService: UsersRepositoryService,
    private authCodeSerice: AuthCodeService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async logIn(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.usersRepositoryService.findOne(loginUserDto.email);

    // If user doesn't exists return OK,
    // we don't want to give any information about our registered users.
    // A mail with authentication code will not be sent.
    if (!user) return;

    if (!isMatch(loginUserDto.password, user.password)) {
      throw new HttpException('Invalid credentials', HttpStatus.FORBIDDEN);
    }

    // Generate new code and send it via email service
    if (user && !loginUserDto.code) {
      const authCode = await this.authCodeSerice.generateNewAuthCode(ReasonEnum.LOGIN, user);
      this.mailService.sendAuthCode(user, authCode.code);
      return;
    }

    // Verify user and code
    if (user && loginUserDto.code) {
      // If user is already active then validate just the auth code. Otherwise the activation of the user will be performed
      const verify = user.active
        ? await this.usersService.verifyCode(user, loginUserDto.code)
        : await this.usersService.verifyCodeAndActivate(user, loginUserDto.code);

      if (verify) {
        // Generate Access Token
        const payload = {sub: user.id, email: user.email};
        return {
          access_token: await this.jwtService.signAsync(payload),
        };
      }
      return verify;
    }
  }
}
