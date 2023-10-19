import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user';
import { executeBashSript } from './utils';
import { Proposal } from './entities/proposal';
import { Invitation } from './entities/invitation';
import { Member } from './entities/member';
import { Node } from './entities/node';
import { InjectAwsService } from 'nest-aws-sdk';
import { ManagedBlockchain } from 'aws-sdk';

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);
    private readonly SCRIPTS_PATH = path.join(process.cwd(), 'src', 'blockchain', 'scripts');

    constructor(
        @InjectAwsService(ManagedBlockchain) 
        private readonly managedBlockchain: ManagedBlockchain,
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
     * Retrieve all proposals for aws account and network configured
     * @param user 
     */
    async getAllProposals(user: User): Promise<Array<Proposal>> {
        this.logger.log(`Start retrieving proposals list for AWS account ${user.awsClientId}`);
        
        const awsListProposalsScriptPath = path.join(this.SCRIPTS_PATH, 'awsListProposals.sh');
        return await executeBashSript(
            awsListProposalsScriptPath, [this.configService.get('AWS_NETWORK_ID')], this.logger)
            .then(response => {
                const objResponse: Array<any> = JSON.parse(response)["Proposals"];
                let proposals: Array<Proposal> = new Array();
                objResponse.forEach(el => {
                    proposals.push(new Proposal(el));
                })
                return proposals;
            });
    }

    /**
     * Get all invitations for aws account configured
     * @returns 
     */
    async getAllInvitations(user: User): Promise<Array<Invitation>> {
        this.logger.log(`Start retrieving invitation list for AWS account ${user.awsClientId}`);
       
        return (await this.managedBlockchain.listInvitations().promise()).Invitations
            .map(invitation => new Invitation(invitation));
    }

    /**
     * Get all 
     * @param user 
     * @returns 
     */
    async getAllOwnedMembers(user: User): Promise<Array<Member>> {
        this.logger.log(`Start retrieving member list for AWS account ${user.awsClientId}`);
        
        try {
            return (await this.managedBlockchain.listMembers({NetworkId: this.configService.get('AWS_NETWORK_ID')}).promise()).Members
                .filter(member => member.IsOwned)
                .map(member => new Member(member));
        } catch (err) {
            this.logger.warn(err);
            return new Array();
        }
    }

    /**
     * Retrieve all nodes for aws account and network configured
     * @param user 
     */
    async getPeerNodeById(nodeId: string, memberId?: string): Promise<Node> {
        this.logger.log(`Start retrieving peer node with ID ${nodeId} and member ID ${memberId}`);

        return new Node((await this.managedBlockchain.getNode({
            NodeId: nodeId, 
            NetworkId: this.configService.get('AWS_NETWORK_ID'), 
            MemberId: memberId
        }).promise()).Node, memberId)
    }

    /**
     * Retrieve all nodes of a member
     * @param memberId 
     * @returns 
     */
    async getAllPeerNodesByMemberId(memberId: string): Promise<Array<Node>> {
        try {
            return (await this.managedBlockchain.listNodes({
                NetworkId: this.configService.get('AWS_NETWORK_ID'), 
                MemberId: memberId
            }).promise()).Nodes
            .map(node => new Node(node, memberId));
        } catch (err) {
            this.logger.warn(err);
            return new Array();
        }
    }

    /**
     * Generates Aws member inside client netowrk
     * @param user 
     */
    async acceptInvitationAndCreateMember(user: User): Promise<string> {
        const invitation: Invitation = user.invitations.sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime()).at(0);

        this.logger.log(`Start generating AWS Member | AwsClientId ${user.awsClientId} | InvitationId ${invitation.invitationId}`);

        return (await this.managedBlockchain.createMember({
            ClientRequestToken: user.id,
            InvitationId: invitation.invitationId, 
            NetworkId: this.configService.get('AWS_NETWORK_ID'),
            MemberConfiguration: {
                Name: user.organization + user.members.length + 1,
                Description: 'Member generated from doxee platform',
                FrameworkConfiguration: {
                    Fabric: {
                        AdminUsername: user.name+user.surname,
                        AdminPassword: 'AP_' + user.id.substring(0, 8)
                    },
                },
            },
        }).promise()).MemberId;
    }

    async createPeerNode(user: User): Promise<Node> {
        if(user.members.length < 1)
            throw new HttpException('Cannot create a peer node without a member', HttpStatus.CONFLICT);
        const member: Member = user.members?.sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime()).at(0);
        this.logger.log(`Start creating AWS peer node | AwsClientId ${user.awsClientId} | MemberId ${member.memberId}`);


        const nodeId = (await this.managedBlockchain.createNode({
            ClientRequestToken: user.id,
            NetworkId: this.configService.get('AWS_NETWORK_ID'),
            NodeConfiguration: {
                InstanceType: 'bc.t3.small',
                AvailabilityZone: this.configService.get('AWS_REGION'),
                StateDB: 'CouchDB'
            },
            MemberId: member.memberId,
        }).promise()).NodeId;

        return await this.getPeerNodeById(nodeId, member.memberId);
    }
}
