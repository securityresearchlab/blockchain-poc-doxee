import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ManagedBlockchain} from 'aws-sdk';
import {InjectAwsService} from 'nest-aws-sdk';
import * as path from 'path';
import {User} from 'src/users/entities/user';
import {Invitation} from './entities/invitation';
import {Member} from './entities/member';
import {Node} from './entities/node';
import {Proposal} from './entities/proposal';
import {executeBashSript} from './utils';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly SCRIPTS_PATH = path.join(process.cwd(), 'src', 'blockchain', 'scripts');

  constructor(
    @InjectAwsService(ManagedBlockchain)
    private readonly managedBlockchain: ManagedBlockchain,
    private configService: ConfigService,
  ) {}

  /**
   * Generates proposal for Doxee blockchain
   * @param user
   * @returns
   */
  async generateProposal(user: User): Promise<string> {
    this.logger.log(`Start generating proposal for AWS account: ${user.awsClientId}`);

    // const awsGenerateInvitationScriptPath = path.join(this.SCRIPTS_PATH, 'awsGenerateInvitation.sh');
    // const proposalId: string = await executeBashSript(
    //   awsGenerateInvitationScriptPath,
    //   [user.awsClientId, this.configService.get('AWS_NETWORK_ID'), this.configService.get('AWS_MEMBER_ID')],
    //   this.logger,
    // ).then((response) => {
    //   if (response) return JSON.parse(response)['ProposalId'];
    //   return response;
    // });
  
    const proposalId = (await this.managedBlockchain.createProposal(
      {Actions: {Invitations: [{Principal: user.awsClientId}]},
      NetworkId: this.configService.get('AWS_NETWORK_ID'), 
      MemberId: this.configService.get('AWS_MEMBER_ID'), 
      ClientRequestToken: user.id})
      .promise())
      .ProposalId;

    if (!proposalId) throw new HttpException('Error during proposal generation', HttpStatus.INTERNAL_SERVER_ERROR);

    this.logger.log('proposalId generated: ' + proposalId);

    return proposalId;
  }

  /**
   * Retrieve proposal by ProposalId from doxee network
   * @param proposalId
   * @returns
   */
  async getProposalById(proposalId: string): Promise<Proposal> {
    this.logger.log(`Get proposalId ${proposalId}`);
    const proposals: Array<Proposal> = (await this.managedBlockchain.listProposals(
      {NetworkId: this.configService.get('AWS_NETWORK_ID')})
      .promise())
      .Proposals
      .filter(el => el.ProposalId == proposalId)
      .map(el => new Proposal(el));
    
    if(proposals.length == 0) {
      this.logger.warn(`Proposal ${proposalId} not found`);
      throw new HttpException('Proposal not found', HttpStatus.NOT_FOUND);
    }
    
    return proposals.at(0);
    
    // const awsListProposalsScriptPath = path.join(this.SCRIPTS_PATH, 'awsListProposals.sh');
    // return await executeBashSript(awsListProposalsScriptPath, [this.configService.get('AWS_NETWORK_ID')], this.logger).then((response) => {
    //   const objResponse: Array<any> = JSON.parse(response)['Proposals'];
    //   const proposalObj = objResponse.filter((el) => el.ProposalId == proposalId).at(0);
    //   const proposal = new Proposal(proposalObj);
    //   return proposal;
    // });
  }

  /**
   * Retrieve all proposals for aws account and network configured
   * @param user
   */
  async getAllProposals(user: User): Promise<Array<Proposal>> {
    this.logger.log(`Start retrieving proposals list for AWS account ${user.awsClientId}`);

    return (await this.managedBlockchain.listProposals(
      {NetworkId: this.configService.get('AWS_NETWORK_ID')})
      .promise())
      .Proposals
      .map(el => new Proposal(el));

    // const awsListProposalsScriptPath = path.join(this.SCRIPTS_PATH, 'awsListProposals.sh');
    // return await executeBashSript(awsListProposalsScriptPath, [this.configService.get('AWS_NETWORK_ID')], this.logger).then((response) => {
    //   const objResponse: Array<any> = JSON.parse(response)['Proposals'];
    //   let proposals: Array<Proposal> = new Array();
    //   objResponse.forEach((el) => {
    //     proposals.push(new Proposal(el));
    //   });
    //   return proposals;
    // });
  }

  /**
   * Get all invitations for aws account configured
   * @returns
   */
  async getAllInvitations(user: User): Promise<Array<Invitation>> {
    this.logger.log(`Start retrieving invitation list for AWS account ${user.awsClientId}`);

    return (await this.managedBlockchain.listInvitations().promise()).Invitations.map((invitation) => new Invitation(invitation));
  }

  /**
   * Get all
   * @param user
   * @returns
   */
  async getAllOwnedMembers(user: User): Promise<Array<Member>> {
    this.logger.log(`Start retrieving member list for AWS account ${user.awsClientId}`);

    try {
      return (await this.managedBlockchain.listMembers({NetworkId: this.configService.get('AWS_NETWORK_ID')}).promise()).Members.filter(
        (member) => member.IsOwned,
      ).map((member) => new Member(member));
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

    return new Node(
      (
        await this.managedBlockchain
          .getNode({
            NodeId: nodeId,
            NetworkId: this.configService.get('AWS_NETWORK_ID'),
            MemberId: memberId,
          })
          .promise()
      ).Node,
      memberId,
    );
  }

  /**
   * Retrieve all nodes of a member
   * @param memberId
   * @returns
   */
  async getAllPeerNodesByMemberId(memberId: string): Promise<Array<Node>> {
    try {
      return (
        await this.managedBlockchain
          .listNodes({
            NetworkId: this.configService.get('AWS_NETWORK_ID'),
            MemberId: memberId,
          })
          .promise()
      ).Nodes.map((node) => new Node(node, memberId));
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

    return (
      await this.managedBlockchain
        .createMember({
          ClientRequestToken: user.id,
          InvitationId: invitation.invitationId,
          NetworkId: this.configService.get('AWS_NETWORK_ID'),
          MemberConfiguration: {
            Name: user.organization + user.members.length + 1,
            Description: 'Member generated from doxee platform',
            FrameworkConfiguration: {
              Fabric: {
                AdminUsername: user.name + user.surname,
                AdminPassword: 'AP_' + user.id.substring(0, 8),
              },
            },
          },
        })
        .promise()
    ).MemberId;
  }

  /**
   * Creates peer node inside last generated member
   * @param user
   * @returns
   */
  async createPeerNode(user: User): Promise<Node> {
    if (user.members.length < 1) throw new HttpException('Cannot create a peer node without a member', HttpStatus.CONFLICT);
    const member: Member = user.members?.sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime()).at(0);
    this.logger.log(`Start creating AWS peer node | AwsClientId ${user.awsClientId} | MemberId ${member.memberId}`);

    const nodeId = (
      await this.managedBlockchain
        .createNode({
          ClientRequestToken: user.id,
          NetworkId: this.configService.get('AWS_NETWORK_ID'),
          NodeConfiguration: {
            InstanceType: 'bc.t3.small',
            AvailabilityZone: this.configService.get('AWS_REGION'),
            StateDB: 'CouchDB',
          },
          MemberId: member.memberId,
        })
        .promise()
    ).NodeId;

    return await this.getPeerNodeById(nodeId, member.memberId);
  }
}
