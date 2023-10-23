import { Controller, Get } from '@nestjs/common';
import { AuthCodeService } from './auth-code.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ReqUser } from 'src/users/decorators/users.decorator';
import { User } from 'src/users/entities/user';

@Controller('/api/v0/auth-code')
export class AuthCodeController {

    constructor(private authCodeService: AuthCodeService) {}

    @Get('all')
    findAll() {
        return this.authCodeService.findAll();
    }

    @Get('valid')
    @ApiBearerAuth()
    findAllValid(@ReqUser() user: User) {
        return this.authCodeService.findValidAuthCodeByUser(user);
    }
}
