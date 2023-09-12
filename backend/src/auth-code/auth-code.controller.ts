import { Controller, Get } from '@nestjs/common';
import { AuthCodeService } from './auth-code.service';

@Controller('/api/v0/auth-code')
export class AuthCodeController {

    constructor(private authCodeService: AuthCodeService) {}

    @Get('all')
    findAll() {
        return this.authCodeService.findAll();
    }

    @Get('valid')
    findAllValid() {
        return this.authCodeService.findValidAuthCodeByUser();
    }
}
