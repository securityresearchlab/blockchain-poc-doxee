import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user';
import { executeBashSript } from './utils';
import { Proposal } from './entities/proposal';

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);

    private readonly SCRIPTS_PATH = path.join(process.cwd(), 'src', 'blockchain', 'scripts');

    constructor(
        private configService: ConfigService, 
        private mailService: MailService
    ) {}

    /**
     * Generates invitation for Doxee blockchain
     * @param user 
     * @returns 
     */
    async generateProposal(user: User): Promise<string> {
        this.logger.log('Start enrolling organization: ' + user.organization);

        const awsGenerateInvitationScriptPath = path.join(this.SCRIPTS_PATH, 'awsGenerateInvitation.sh');
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

    async getProposalById(proposalId: string): Promise<Proposal> {
        this.logger.log(`Get proposalId ${proposalId}`);
        const awsListProposalsScriptPath = path.join(this.SCRIPTS_PATH, 'awsListProposals.sh');
        return await executeBashSript(
            awsListProposalsScriptPath, 
            [this.configService.get("AWS_NETWORK_ID")],
            this.logger)
            .then(response => {
                const objResponse: Array<any> = JSON.parse(response)["Proposals"];
                const proposalObj = objResponse.filter(el => el.ProposalId == proposalId).at(0);
                const proposal = new Proposal(proposalObj);
                this.logger.log(JSON.stringify(proposal));
                return proposal;
            });
    }

    /**
     * Generates Aws infrastructure inside client netowrk
     * @param user 
     */
    async generateAwsInfrastructure(user: User) {
        this.logger.log(`Start generating AWS Infrastructure | AwsClientId ${user.awsClientId} | ProposalId ${user.proposals}`);
        
        const awsAcceptInvitationAndCreateMemberScriptPath = path.join(this.SCRIPTS_PATH, 'awsAcceptInvitationAndCreateMember.sh');
        const memebrId: string = await executeBashSript(
            awsAcceptInvitationAndCreateMemberScriptPath, 
            [
                this.configService.get('AWS_NETWORK_ID'),
                // user.proposalId,
                user.organization,
                `${user.organization} DOXEE organization`,
                user.name + user.surname,
                user.password,
            ], 
            this.logger
        ).then(res => {
            if(res) return JSON.parse(res)['MemberId'];
            return res;
        });
        
        this.logger.log(`Successfully generated AWS Infrastructure | AwsClientId ${user.awsClientId} | ProposalId ${user.proposals}`);
    }

}
