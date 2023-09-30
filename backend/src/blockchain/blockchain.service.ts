import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user';
import { executeBashSript } from './utils';
import { Proposal } from './entities/proposal';
import { Invitation } from './entities/invitation';

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
        this.logger.log(`Start enrolling organization: ${user.organization}`);

        const awsGenerateInvitationScriptPath = path.join(this.SCRIPTS_PATH, 'awsGenerateInvitation.sh');
        const proposalId: string = await executeBashSript(
            awsGenerateInvitationScriptPath, 
            [
                user.awsClientId,
                this.configService.get('AWS_NETWORK_ID'),
                this.configService.get('AWS_MEMBER_ID'),
            ], 
            this.logger
        ).then(response => {
            if(response) return JSON.parse(response)['ProposalId'];
            return response;
        });

        this.logger.log("proposalId generated: " + proposalId);

        // Send proposalId to client Email
        if (proposalId) {
            this.mailService.sendProposalId(user, proposalId);
            return proposalId
        }

        throw new HttpException('Error during Org initialization', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Retrieve proposal by ProposalId from doxee network
     * @param proposalId 
     * @returns 
     */
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
                return proposal;
            });
    }

    /**
     * Get all invitations for aws account configured
     * @returns 
     */
    async getAllInvitations(user: User): Promise<Array<Invitation>> {
        this.logger.log(`Start retrieving invitation list for AWS account ${user.awsClientId}`);
        
        const awsListInvitationsScriptPath = path.join(this.SCRIPTS_PATH, 'awsListInvitations.sh');
        return await executeBashSript(awsListInvitationsScriptPath, [], this.logger)
            .then(response => {
                const objResponse: Array<any> = JSON.parse(response)["Invitations"];
                let invitations: Array<Invitation> = new Array();
                objResponse.forEach(el => {
                    invitations.push(new Invitation(el));
                })
                return invitations;
            });
    }

    /**
     * Generates Aws member inside client netowrk
     * @param user 
     */
    async acceptInvitationAndCreateMember(user: User): Promise<string> {
        this.logger.log(`Start generating AWS Infrastructure | AwsClientId ${user.awsClientId} | ProposalId ${user.proposals}`);
        
        const invitation: Invitation = user.invitations.sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime()).at(0);

        const awsAcceptInvitationAndCreateMemberScriptPath = path.join(this.SCRIPTS_PATH, 'awsAcceptInvitationAndCreateMember.sh');
        const memberConfig = `'Name=${user.organization.replaceAll('.', '')},Description=${user.organization.replaceAll('.', '')},FrameworkConfiguration={Fabric={AdminUsername=${user.name + user.surname},AdminPassword=${user.id.replaceAll('-', '')}}}'`;
        return await executeBashSript(
            awsAcceptInvitationAndCreateMemberScriptPath, 
            [
                this.configService.get('AWS_NETWORK_ID'),
                invitation.invitationId,
                `Name=${user.organization},Description=${user.organization},FrameworkConfiguration={Fabric={AdminUsername=${user.name+user.surname},AdminPassword=${user.id}}}`
            ], 
            this.logger
        ).then(response => {
            if(response)  {
                const memberId: string = JSON.parse(response)['MemberId'];
                this.logger.log(`Successfully generated AWS Mmeber | AwsClientId ${user.awsClientId} | MemberId ${memberId}`);
                return memberId;
            }
        }).catch(error => {
            throw new HttpException('Error during the creation of memeber', HttpStatus.INTERNAL_SERVER_ERROR);
        });
        
    }

}
