import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from 'src/users/dto/signup-user-dto';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from 'src/users/dto/login-user-dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags("auth")
@Controller('/api/v0/secure/auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(
        private authService: AuthService, 
        private usersService: UsersService
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiBody({type: LoginUserDto})
    @ApiResponse({status: HttpStatus.OK, description: 'User authenticated successfully.'})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Credentials are invalid.'})
    signIn(@Body() loginUserDto: LoginUserDto) {
        try {
            return this.authService.signIn(loginUserDto);
        } catch (error) {
            return error;
        }
    }

    @Post('signUp')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({transform: true}))
    @ApiBody({type: SignUpUserDto})
    @ApiResponse({status: HttpStatus.OK, description: 'User created successfully.'})
    @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error during registration process.'})
    async signUp(@Res() res: Response, @Body() signUpUserDto: SignUpUserDto) {
        try {
            await this.usersService.saveOne(signUpUserDto);
            res.status(HttpStatus.CREATED).send({});
        } catch (error) {
            return error;
        }
    }
}