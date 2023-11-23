import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {InjectRepository} from '@nestjs/typeorm';
import {AuthCodeService} from 'src/auth-code/auth-code.service';
import {AuthCode} from 'src/auth-code/entities/auth-code';
import {ReasonEnum} from 'src/auth-code/entities/reason-enum';
import {hash} from 'src/auth-code/utils/crypt-and-decrypt';
import {BlockchainService} from 'src/blockchain/blockchain.service';
import {Invitation} from 'src/blockchain/entities/invitation';
import {Member} from 'src/blockchain/entities/member';
import {Node} from 'src/blockchain/entities/node';
import {Proposal} from 'src/blockchain/entities/proposal';
import {AppModeEnum} from 'src/config/app-mode-enum';
import {MailService} from 'src/mail/mail.service';
import {Repository} from 'typeorm';
import {SignUpUserDto} from './dto/signup-user-dto';
import {User} from './entities/user';
import {UsersRepositoryService} from './users.repository.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private authCodeService: AuthCodeService,
    private blockchainService: BlockchainService,
    private mailService: MailService,
    private configService: ConfigService,
    private usersRepositoryService: UsersRepositoryService,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Node)
    private noderepository: Repository<Node>,
  ) {}

  async findOne(email: string): Promise<User> {
    let user = await this.usersRepositoryService.findOne(email);

    if (user) {
      try {
        await this.updateProposals(user);
        if (this.configService.get('APP_MODE') == AppModeEnum.CLIENT) {
          await this.updateInvitations(user);
          await this.updateMembers(user);
          await this.updateNodes(user);
        }
      } catch (err) {
        // TODO: improve transaction management and remove this try/catch statement
        this.logger.warn(err);
      }
    }
    return user;
  }

  /**
   * Main process to register a new user to Doxee platform
   * @param signUpUserDto
   * @returns
   */
  async saveOne(signUpUserDto: SignUpUserDto) {
    this.logger.log(`Start saving new user: ${signUpUserDto.email}`);
    const existingUser: User = await this.findOne(signUpUserDto.email);
    let user: User = existingUser ? existingUser : new User();

    // If user already exists then generate new auth code and saving a new one.
    if (existingUser) return await this.generateNewAuthCode(existingUser, user);

    // Create new user
    this.logger.log('Creating new user');
    user.name = signUpUserDto.name;
    user.surname = signUpUserDto.surname;
    user.organization = signUpUserDto.organization;
    user.awsClientId = signUpUserDto.awsClientId;
    user.email = signUpUserDto.email;
    user.password = await hash(signUpUserDto.password);
    user.authCodes = new Array();
    user.proposals = new Array();
    user.invitations = new Array();
    user.members = new Array();
    user.nodes = new Array();

    return await this.saveWithNewAuthCode(user);
  }

  /**
   * Entry point to validate and activate user in INVITATION or CLIENT mode
   * @param user
   * @param authCode
   * @returns
   */
  async verifyCodeAndActivate(user: User, authCode: string) {
    this.logger.log('APP_MODE : ' + this.configService.get('APP_MODE'));
    return (await this.configService.get('APP_MODE')) == AppModeEnum.INVITATION
      ? this.verifyCodeAndActivateUser(user, authCode)
      : this.verifyCodeAndActivateClientUser(user, authCode);
  }

  /**
   * Given an existing user and an auth code it invalidate used code and activate user.
   * In this method if user is not active yet a new invitation will be sent to client.
   * @param user
   * @param authCode
   * @returns
   */
  private async verifyCodeAndActivateUser(user: User, authCode: string): Promise<any> {
    const verify = await this.authCodeService.verifyCode(user, authCode);
    return await this.usersRepositoryService.getManager().transaction(async (transactionManager) => {
      if (verify?.length > 0) {
        const proposalId = await this.blockchainService.generateProposal(user);
        this.mailService.sendProposalId(user, proposalId);
        user.proposals.push(await transactionManager.save(await this.blockchainService.getProposalById(proposalId)));
        await transactionManager.update(AuthCode, {user: user}, {used: true});
        user.active = true;
        user = await transactionManager.save(user);
        await transactionManager.release();
        return user;
      }
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    });
  }

  /**
   * Given an existing user and an auth code if the user is inactive it will be activated
   * and invitations are loaded
   * @param user
   * @param authCode
   * @returns
   */
  private async verifyCodeAndActivateClientUser(user: User, authCode: string) {
    const verify = await this.authCodeService.verifyCode(user, authCode);
    return await this.usersRepositoryService.getManager().transaction(async (transactionManager) => {
      if (verify?.length > 0) {
        await transactionManager.update(AuthCode, {user: user}, {used: true});
        user.active = true;
        user.invitations = await transactionManager.save(await this.blockchainService.getAllInvitations(user));
        user = await transactionManager.save(user);
        await transactionManager.release();
        return user;
      }
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    });
  }

  /**
   * Generates a new proposal
   * @param email
   */
  async generateNewProposal(email: string) {
    this.logger.log(`Start generating new proposal for ${email}`);
    let user: User = await this.findOne(email);
    const proposalId = await this.blockchainService.generateProposal(user);
    this.mailService.sendProposalId(user, proposalId);
    const proposal = await this.blockchainService.getProposalById(proposalId);
    user.proposals.push(await this.usersRepositoryService.getManager().save(proposal));
    await this.usersRepositoryService.getManager().save(user);
    return proposal;
  }

  /**
   * Accept last invitation and creates member
   * @param user
   * @returns
   */
  async acceptInvitationAndCreateMember(user: User): Promise<User> {
    this.logger.log(`Start accepting invitation for AWS client ${user.awsClientId}`);

    user = await this.usersRepositoryService.findOne(user.email);
    await this.blockchainService.acceptInvitationAndCreateMember(await this.findOne(user.email));
    user.members.push(...(await this.blockchainService.getAllOwnedMembers(user)));
    await this.updateInvitations(user);
    return await this.usersRepositoryService.getManager().save(user);
  }

  /**
   * Create peer node for last memberId available
   * @param user
   * @returns
   */
  async createPeerNode(user: User): Promise<User> {
    user = await this.usersRepositoryService.findOne(user.email);
    this.logger.log(`Start creation of Peer Node for AWS client ${user.awsClientId}`);

    user.nodes.push(await this.noderepository.save(await this.blockchainService.createPeerNode(user)));

    return await this.usersRepositoryService.getManager().save(user);
  }

  /**
   * Given an existing user and an auth code it invalidate used code and activate user.
   * In this method if user is not active yet a new organization will be registered in the network.
   * @param user
   * @param authCode
   * @returns
   */
  async verifyCode(user: User, authCode: string): Promise<any> {
    return await this.usersRepositoryService.getManager().transaction(async (transactionManager) => {
      const verify = await this.authCodeService.verifyCode(user, authCode);
      if (verify?.length > 0) return await transactionManager.update(AuthCode, {user: user}, {used: true});
      await transactionManager.release();
      throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
    });
  }

  /**
   * Generates new AuthCode for existing user and sends it via email
   * @param existingUser
   * @param user
   * @returns
   */
  private async generateNewAuthCode(existingUser: User, user: User): Promise<AuthCode> {
    return await this.usersRepositoryService.getManager().transaction(async (transactionManager) => {
      const authCode = await this.authCodeService.generateNewAuthCode(ReasonEnum.SIGN_UP, existingUser);
      user.authCodes.push(authCode);
      await transactionManager.save(user);
      await transactionManager.release();
      this.mailService.sendAuthCode(user, authCode.code);
      return authCode;
    });
  }

  /**
   * Updates all proposals of given user retrieving items from AWS account
   * @param user
   * @returns
   */
  private async updateProposals(user: User): Promise<Array<Proposal>> {
    user = await this.usersRepositoryService.findOne(user.email);
    this.logger.log(`Start updating proposals for AWS Client ID ${user.awsClientId}`);

    const proposals: Array<Proposal> = await this.blockchainService.getAllProposals(user);
    return await this.usersRepositoryService.getManager().transaction(async (transactionManager) => {
      proposals.forEach(async (el) => {
        if (user.proposals.filter((ui) => ui.proposalId == el.proposalId).length > 0) {
          await transactionManager.update(Proposal, {proposalId: el.proposalId}, {status: el.status});
        } else {
          user.proposals.push(await this.proposalRepository.save(el));
          await transactionManager.save(user);
        }
      });
      this.logger.log(`Updated proposals for AWS Client ID ${user.awsClientId}`);
      await transactionManager.release();
      return user.proposals;
    });
  }

  /**
   * Updates all invitations of given user retrieving items from AWS account
   * @param user
   * @returns
   */
  private async updateInvitations(user: User): Promise<Array<Invitation>> {
    user = await this.usersRepositoryService.findOne(user.email);
    this.logger.log(`Start updating invitations for AWS Client ID ${user.awsClientId}`);

    const invitations: Array<Invitation> = await this.blockchainService.getAllInvitations(user);
    return await this.usersRepositoryService.getManager().transaction(async (transactionManager) => {
      invitations.forEach(async (el) => {
        if (user.invitations.filter((ui) => ui.invitationId == el.invitationId).length > 0) {
          await transactionManager.update(Invitation, {invitationId: el.invitationId}, {status: el.status});
        } else {
          user.invitations.push(await this.invitationRepository.save(el));
          await transactionManager.save(user);
        }
      });
      this.logger.log(`Updated invitations for AWS Client ID ${user.awsClientId}`);
      await transactionManager.release();
      return user.invitations;
    });
  }

  /**
   * Updates all invitations of given user retrieving items from AWS account
   * @param user
   * @returns
   */
  private async updateMembers(user: User): Promise<Array<Member>> {
    user = await this.usersRepositoryService.findOne(user.email);
    this.logger.log(`Start updating members for AWS Client ID ${user.awsClientId}`);

    let members = new Array<Member>();
    try {
      members = await this.blockchainService.getAllOwnedMembers(user);
    } catch (err) {
      this.logger.warn(`No members was found for current AWS Client ID ${user.awsClientId}`);
      return members;
    }
    await this.usersRepositoryService.getManager().transaction(async (transactionManager) => {
      members.forEach(async (el) => {
        if (user.members.filter((ui) => ui.memberId == el.memberId).length > 0) {
          await transactionManager.update(Member, {memberId: el.memberId}, {status: el.status});
        } else {
          user.members.push(await this.memberRepository.save(el));
          await transactionManager.save(user);
        }
      });
      this.logger.log(`Updated members for AWS Client ID ${user.awsClientId}`);
      await transactionManager.release();
    });
    return user.members;
  }

  private async updateNodes(user: User): Promise<Array<Node>> {
    user = await this.usersRepositoryService.findOne(user.email);
    this.logger.log(`Start updating nodes for AWS Client ID ${user.awsClientId}`);

    user.members?.forEach(async (member) => {
      const nodes = await this.blockchainService.getAllPeerNodesByMemberId(member.memberId);
      nodes.forEach(async (el) => {
        if (user.nodes.filter((un) => un.nodeId == el.nodeId).length > 0) {
          await this.usersRepositoryService.getManager().update(Node, {nodeId: el.nodeId}, {status: el.status});
        } else {
          user.nodes.push(await this.noderepository.save(el));
          await this.usersRepositoryService.getManager().save(user);
        }
      });
      this.logger.log(`Updated nodes for Member ID ${member.memberId}`);
    });

    return user.nodes;
  }

  /**
   * Store user
   * @param user
   * @returns
   */
  private async saveWithNewAuthCode(user: User) {
    return await this.usersRepositoryService.getManager().transaction(async (transactionEntityManger) => {
      const savedUser = await transactionEntityManger.save(user);
      const authCode = await this.authCodeService.generateNewAuthCode(ReasonEnum.SIGN_UP, savedUser);
      await transactionEntityManger.save(authCode);
      this.logger.log(`Stored new user ${user.id} with new auth code`);
      this.mailService.sendAuthCode(user, authCode.code);
    });
  }
}
