import {Body, Controller, HttpCode, HttpStatus, Logger, Post, Res, UsePipes, ValidationPipe} from '@nestjs/common';
import {ApiBody, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Response} from 'express';
import {LoginUserDto} from 'src/users/dto/login-user-dto';
import {SignUpUserDto} from 'src/users/dto/signup-user-dto';
import {UsersService} from 'src/users/users.service';
import {AuthService} from './auth.service';

@ApiTags('auth')
@Controller('/api/v0/secure/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({transform: true}))
  @ApiBody({type: LoginUserDto})
  @ApiResponse({status: HttpStatus.OK, description: 'User authenticated successfully.'})
  @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Credentials are invalid.'})
  login(@Body() loginUserDto: LoginUserDto) {
    try {
      return this.authService.logIn(loginUserDto);
    } catch (error) {
      return error;
    }
  }

  @Post('signUp')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({transform: true}))
  @ApiBody({type: SignUpUserDto})
  @ApiResponse({status: HttpStatus.OK, description: 'User created successfully.'})
  @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Fields doesn't respect application constraints"})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error during registration process.'})
  async signUp(@Res() res: Response, @Body() signUpUserDto: SignUpUserDto) {
    await this.usersService.saveOne(signUpUserDto);
    res.status(HttpStatus.CREATED).send('User created successfully');
  }
}
