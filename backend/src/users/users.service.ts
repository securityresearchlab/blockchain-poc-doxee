import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthCodeService } from 'src/auth-code/auth-code.service';
import { AuthCode } from 'src/auth-code/entities/auth-code';
import { ReasonEnum } from 'src/auth-code/entities/reason-enum';
import { hash } from 'src/auth-code/utils/crypt-and-decrypt';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { Proposal } from 'src/blockchain/entities/proposal';
import { ProposalStatusEnum } from 'src/blockchain/entities/proposal-status-enum';
import { AppModeEnum } from 'src/config/app-mode-enum';
import { MailService } from 'src/mail/mail.service';
import { SignUpUserDto } from './dto/signup-user-dto';
import { User } from './entities/user';
import { UsersRepositoryService } from './users.repository.service';
import { Invitation } from 'src/blockchain/entities/invitation';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/blockchain/entities/member';

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
    ) {}

    async findOne(email: string): Promise<User> {
        let user = await this.usersRepositoryService.findOne(email);
        
        if(user) {
            await this.updateProposals(user);
            await this.updateInvitations(user);
        }

        return user; 
    }

    /**
     * Main process to register a new user to Doxee platform
     * @param signUpUserDto 
     * @returns 
     */
    async saveOne(signUpUserDto: SignUpUserDto) {
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
        user.proposals = new Array();
        user.invitations = new Array();
        user.authCodes = new Array();
        
        return await this.saveWithNewAuthCode(user);
    } 

    /**
     * Entry point to validate and activate user in INVITATION or CLIENT mode
     * @param user 
     * @param authCode 
     * @returns 
     */
    async verifyCodeAndActivate(user: User, authCode: string) {
        this.logger.log("APP_MODE : " + this.configService.get('APP_MODE'));
        return await this.configService.get('APP_MODE') == AppModeEnum.INVITATION ?
            this.verifyCodeAndActivateUser(user, authCode) :
            this.verifyCodeAndActivateClientUser(user, authCode);
    }

    /**
     * Given an existing user and an auth code it invalidate used code and activate user.
     * In this method if user is not active yet a new invitation will be sent to client.
     * @param user 
     * @param authCode 
     * @returns 
     */
    private async verifyCodeAndActivateUser(user: User, authCode: string): Promise<any> {
        return await this.usersRepositoryService.getManager().transaction(
            async (transactionManager) => {
                const verify = await this.authCodeService.verifyCode(user, authCode);
                if (verify?.length > 0) {
                    const proposalId = await this.blockchainService.generateProposal(user);
                    user.proposals.push(await transactionManager.save(await this.blockchainService.getProposalById(proposalId)));
                    await transactionManager.update(AuthCode, {user: user}, {used: true});
                    user.active = true;
                    user = await transactionManager.save(user);
                    await transactionManager.release();
                    return user;
                } 
                throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
            }
        )
    }

    /**
     * Given an existing user and an auth code if the user is inactive it will be activated 
     * and invitations are loaded
     * @param user 
     * @param authCode 
     * @returns 
     */
    private async verifyCodeAndActivateClientUser(user: User, authCode: string) {
        return await this.usersRepositoryService.getManager().transaction(
            async (transactionManager) => {
                const verify = await this.authCodeService.verifyCode(user, authCode);
                if (verify?.length > 0) {
                    await transactionManager.update(AuthCode, {user: user}, {used: true});
                    user.active = true;
                    user.invitations = await transactionManager.save(await this.blockchainService.getAllInvitations(user));
                    user = await transactionManager.save(user);
                    await transactionManager.release();
                    return user;
                } 
                throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
            }
        )
    }

    /**
     * Generate new proposal if no one is already ACCEPTED
     * @param email 
     */
    async generateNewProposal(email: string) {
        this.logger.log(`Start generating new proposal for ${email}`);
        let user: User = await this.findOne(email); 
        if(user.proposals.filter(proposal => 
            proposal.status == ProposalStatusEnum.APPROVED || proposal.status == ProposalStatusEnum.IN_PROGRESS).length > 0)
            throw new HttpException('Unable to generate new Proposal', HttpStatus.FORBIDDEN);

        const proposalId = await this.blockchainService.generateProposal(user);
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
        user.memebers.push(...await this.blockchainService.getAllOwnedMembers(user));
        await this.updateInvitations(user);
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
        return await this.usersRepositoryService.getManager().transaction(
            async (transactionManager) => {
                const verify = await this.authCodeService.verifyCode(user, authCode);
                if (verify?.length > 0) 
                    return await transactionManager.update(AuthCode, {user: user}, {used: true});
                await transactionManager.release();
                throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
            }
        )
    }

    /**
     * Generates new AuthCode for existing user and sends it via email
     * @param existingUser 
     * @param user 
     * @returns 
     */
    private async generateNewAuthCode(existingUser: User, user: User): Promise<AuthCode> {
        return await this.usersRepositoryService.getManager().transaction(
            async (transactionManager) => {
                const authCode = await this.authCodeService.generateNewAuthCode(ReasonEnum.SIGN_UP, existingUser);
                user.authCodes.push(authCode);
                await transactionManager.save(user);
                await transactionManager.release();
                this.mailService.sendAuthCode(user, authCode.code);
                return authCode;
            }
        )
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
        return await this.usersRepositoryService.getManager().transaction(
            async (transactionManager) => {
                proposals.forEach(async el => {
                    if(user.proposals.filter(ui => ui.proposalId == el.proposalId).length > 0) {
                        await transactionManager.update(Proposal, {proposalId: el.proposalId}, {status: el.status})
                    } else {
                        user.proposals.push(await this.proposalRepository.save(el));
                        await transactionManager.save(user);
                    }
                });
                this.logger.log(`Updated proposals for AWS Client ID ${user.awsClientId}`);
                await transactionManager.release();
                return user.proposals;
            }
        );
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
        return await this.usersRepositoryService.getManager().transaction(
            async (transactionManager) => {
                invitations.forEach(async el => {
                    if(user.invitations.filter(ui => ui.invitationId == el.invitationId).length > 0) {
                        await transactionManager.update(Invitation, {invitationId: el.invitationId}, {status: el.status})
                    } else {
                        user.invitations.push(await this.invitationRepository.save(el));
                        await transactionManager.save(user);
                    }
                });
                this.logger.log(`Updated invitations for AWS Client ID ${user.awsClientId}`);
                await transactionManager.release();
                return user.invitations;
            }
        );
    }

    /**
     * Updates all invitations of given user retrieving items from AWS account
     * @param user 
     * @returns 
     */
    private async updateMembers(user: User): Promise<Array<Member>> {
        user = await this.usersRepositoryService.findOne(user.email);
        this.logger.log(`Start updating members for AWS Client ID ${user.awsClientId}`);

        const members: Array<Member> = await this.blockchainService.getAllOwnedMembers(user);
        return await this.usersRepositoryService.getManager().transaction(
            async (transactionManager) => {
                members.forEach(async el => {
                    if(user.memebers.filter(ui => ui.memberId == el.memberId).length > 0) {
                        await transactionManager.update(Member, {memberId: el.memberId}, {status: el.status})
                    } else {
                        user.memebers.push(await this.memberRepository.save(el));
                        await transactionManager.save(user);
                    }
                });
                this.logger.log(`Updated members for AWS Client ID ${user.awsClientId}`);
                await transactionManager.release();
                return user.memebers;
            }
        );
    }

    /**
     * Store user
     * @param user 
     * @returns 
     */
    private async saveWithNewAuthCode(user: User) {
        return await this.usersRepositoryService.getManager().transaction(
            async (transactionEntityManger) => {
                const savedUser = await transactionEntityManger.save(user);
                const authCode = await this.authCodeService.generateNewAuthCode(ReasonEnum.SIGN_UP, savedUser);
                await transactionEntityManger.save(authCode);
                this.logger.log(`Stored new user ${user.id} with new auth code`);
                this.mailService.sendAuthCode(user, authCode.code);
            }
        );
    }
}
