import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user';
import { executeBashSript } from './utils';

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);

    constructor(
        private configService: ConfigService, 
        private mailService: MailService
    ) {}

    /**
     * Generates all files needed to create a new organization, invokes scripts and creates a wallet
     * @param user 
     * @returns 
     */
    async enrollOrg(user: User): Promise<string> {
        this.logger.log('Start enrolling organization: ' + user.organization);

        const awsGenerateInvitationScriptPath = path.join(process.cwd(), 'src', 'blockchain', 'scripts', 'awsGenerateInvitation.sh');
        const proposalId: string = await executeBashSript(
            awsGenerateInvitationScriptPath, 
            [
                this.configService.get('AWS_ACCOUNT_ID'),
                this.configService.get('AWS_NETWORK_ID'),
                this.configService.get('AWS_MEMBER_ID'),
            ], 
            this.logger
        ).then(res => {
            if(res) return JSON.parse(res)['ProposalId'];
            return res;
        });

        this.logger.log("proposalId generated: " + proposalId);

        // Send proposalId to client Email
        if (proposalId) {
            this.mailService.sendProposalId(user, proposalId);
            return proposalId
        }

        throw new HttpException('Error during Org initialization', HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
