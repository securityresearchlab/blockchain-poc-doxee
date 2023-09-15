import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthCodeService } from 'src/auth-code/auth-code.service';
import { AuthCode } from 'src/auth-code/entities/auth-code';
import { ReasonEnum } from 'src/auth-code/entities/reason-enum';
import { hash } from 'src/auth-code/utils/crypt-and-decrypt';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { AppModeEnum } from 'src/config/app-mode-enum';
import { MailService } from 'src/mail/mail.service';
import { SignUpClientDto } from './dto/signup-client-dto';
import { SignUpUserDto } from './dto/signup-user-dto';
import { User } from './entities/user';
import { UsersRepositoryService } from './users.repository.service';
import { Proposal } from 'src/blockchain/entities/proposal';
import { ProposalStatusEnum } from 'src/blockchain/entities/proposal-status-enum';
import { Invitation } from 'src/blockchain/entities/invitation';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private authCodeService: AuthCodeService,
        private blockchainService: BlockchainService,
        private mailService: MailService,
        private configService: ConfigService,
        private usersRepositoryService: UsersRepositoryService,
    ) {}

    async findOne(email: string): Promise<User> {
        let user = await this.usersRepositoryService.findOne(email);
        await user?.proposals?.forEach(async proposal => {
            proposal.status = ProposalStatusEnum[(await this.blockchainService.getProposalById(proposal.proposalId)).status];
            await this.usersRepositoryService.getManager().update(Proposal, {user: user, proposalId: proposal.proposalId}, {status: proposal.status});
        })
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
        user.name = signUpUserDto.name;
        user.surname = signUpUserDto.surname;
        user.organization = signUpUserDto.organization;
        user.awsClientId = signUpUserDto.awsClientId;
        user.email = signUpUserDto.email;
        user.password = await hash(signUpUserDto.password);
        user.proposals = new Array();
        user.invitations = new Array();
        user.authCodes = new Array();
        
        return await this.save(user);
    } 

    /**
     * Store new user client applicattion
     * @param singUpClientDto 
     * @returns 
     */
    async saveOneClient(singUpClientDto: SignUpClientDto) {
        const existingUser: User = await this.findOne(singUpClientDto.email);
        let user: User = existingUser ? existingUser : new User();

        // If user already exists then generate new auth code and saving a new one.
        if (existingUser) return await this.generateNewAuthCode(existingUser, user);

        // Create new user
        user.name = singUpClientDto.name;
        user.surname = singUpClientDto.surname;
        user.organization = singUpClientDto.organization;
        user.awsClientId = this.configService.get("AWS_ACCOUNT_ID")
        user.email = singUpClientDto.email;
        user.password = await hash(singUpClientDto.password);
        user.authCodes = new Array();
         
        return await this.save(user);
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
            async (transactionManger) => {
                const verify = await this.authCodeService.verifyCode(user, authCode);
                if (verify?.length > 0) {
                    const proposalId = await this.blockchainService.generateProposal(user);
                    user.proposals.push(await transactionManger.save(await this.blockchainService.getProposalById(proposalId)));
                    await transactionManger.update(AuthCode, {user: user}, {used: true});
                    user.active = true;
                    return await transactionManger.save(user);
                } 
                throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
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
            async (transactionManger) => {
                const verify = await this.authCodeService.verifyCode(user, authCode);
                if (verify?.length > 0) {
                    await transactionManger.update(AuthCode, {user: user}, {used: true});
                    user.active = true;
                    user.invitations = await transactionManger.save(await this.blockchainService.getAllInvitations());
                    return await transactionManger.save(user);
                } 
                throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
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
     * Given an existing user and an auth code it invalidate used code and activate user.
     * In this method if user is not active yet a new organization will be registered in the network.
     * @param user 
     * @param authCode 
     * @returns 
     */
    async verifyCode(user: User, authCode: string): Promise<any> {
        return await this.usersRepositoryService.getManager().transaction(
            async (transactionManger) => {
                const verify = await this.authCodeService.verifyCode(user, authCode);
                if (verify?.length > 0) 
                    return await transactionManger.update(AuthCode, {user: user}, {used: true});
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
                this.mailService.sendAuthCode(user, authCode.code);
                return authCode;
            }
        )
    }


    /**
     * Store user
     * @param user 
     * @returns 
     */
    private async save(user: User) {
        return await this.usersRepositoryService.getManager().transaction(
            async (transactionEntityManger) => {
                const savedUser = await transactionEntityManger.save(user);
                const authCode = await this.authCodeService.generateNewAuthCode(ReasonEnum.SIGN_UP, savedUser);
                await transactionEntityManger.save(authCode);
                this.mailService.sendAuthCode(user, authCode.code);
            }
        );
    }
}
