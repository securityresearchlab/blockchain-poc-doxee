import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from 'src/users/dto/signup-user-dto';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from 'src/users/dto/login-user-dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("auth")
@Controller('/api/v0/secure/auth')
export class AuthController {

    constructor(
        private authService: AuthService, 
        private usersService: UsersService
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({transform: true}))
    signIn(@Body() loginUserDto: LoginUserDto) {
        return this.authService.signIn(loginUserDto);
    }

    @Post('signUp')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({transform: true}))
    singUp(@Body() signUpUserDto: SignUpUserDto) {
        return this.usersService.saveOne(signUpUserDto);
    }
}
