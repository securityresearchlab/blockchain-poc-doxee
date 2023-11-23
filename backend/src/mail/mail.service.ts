import {MailerService} from '@nestjs-modules/mailer';
import {Injectable, Logger} from '@nestjs/common';
import {readFileSync} from 'fs';
import {join} from 'path';
import {User} from 'src/users/entities/user';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly authCodeTemplatePath = '/src/mail/templates/authentication-code.ejs';
  private readonly proposalIdTemplatePath = '/src/mail/templates/proposal-id.ejs';
  private authCodeTemplate: String;
  private proposalIdTemplate: String;

  constructor(private mailserService: MailerService) {
    this.authCodeTemplate = readFileSync(join(process.cwd(), this.authCodeTemplatePath)).toString();
    this.proposalIdTemplate = readFileSync(join(process.cwd(), this.proposalIdTemplatePath)).toString();
  }

  async sendAuthCode(user: User, authCode: string) {
    this.logger.log('Sending authcode (' + authCode + ') to: ' + user.email);
    try {
      await this.mailserService.sendMail({
        to: user.email,
        subject: '[Doxee] Authentication Code',
        html: this.authCodeTemplate.replace('<%= locals.name %>', user.name).replace('<%= locals.authcode %>', authCode),
      });
    } catch (error) {
      this.logger.warn(`Error during sendAuthCode to ${user.email}`);
      this.logger.warn(`${JSON.stringify(error)}`);
    }
  }

  async sendProposalId(user: User, proposalId: string) {
    this.logger.log('Sending proposalId (' + proposalId + ') to: ' + user.email);
    try {
      await this.mailserService.sendMail({
        to: user.email,
        subject: '[Doxee] Invitation code - Proposal ID',
        html: this.proposalIdTemplate.replace('<%= locals.name %>', user.name).replace('<%= locals.proposalId %>', proposalId),
      });
    } catch (error) {
      this.logger.warn(`Error during sendProposalId to ${user.email}`);
      this.logger.warn(`${JSON.stringify(error)}`);
    }
  }
}
