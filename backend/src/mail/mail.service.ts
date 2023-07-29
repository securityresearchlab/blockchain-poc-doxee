import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { User } from 'src/users/entities/user';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly templatePath = '/src/mail/templates/authentication-code.ejs';
    private template: String;
    
    constructor(private mailserService: MailerService) {
        this.template = readFileSync(join(process.cwd(), this.templatePath)).toString();
    }

    async sendAuthCode(user: User, authCode: string) {
        this.logger.log('Sending authcode (' + authCode + ') to: ' + user.email);
        await this.mailserService.sendMail({
            to: user.email,
            subject: '[Doxee] Authentication Code',
            // template: './authentication-code',
            // context: {
            //     name: user.name,
            //     authcode: authCode,
            // }
            html: this.template
                .replace('<%= locals.name %>', user.name)
                .replace('<%= locals.authcode %>', authCode),
        });
    }
}
