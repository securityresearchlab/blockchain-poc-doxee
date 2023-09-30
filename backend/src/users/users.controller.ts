import { Controller, Get, HttpException, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ReqUser } from './decorators/users.decorator';
import { ProposalDto } from './dto/proposal-dto';
import { UserDto } from './dto/user-dto';
import { User } from './entities/user';
import { UsersService } from './users.service';

@ApiTags("users")
@Controller('/api/v0/secure/users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(
        private usersService: UsersService
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiResponse({type: UserDto})
    async getUser(@ReqUser() user: User): Promise<UserDto> {
        return new UserDto(await this.usersService.findOne(user.email));
    }

    @Get("generateNewProposal")
    @UseGuards(JwtAuthGuard)
    @ApiResponse({type: ProposalDto})
    async generateNewProposal(@ReqUser() user: User): Promise<ProposalDto> {
        return new ProposalDto(await this.usersService.generateNewProposal(user.email));
    }

    @Post("acceptInvitation")
    @UseGuards(JwtAuthGuard)
    @ApiResponse({type: UserDto})
    async acceptInvitation(@ReqUser() user: User): Promise<UserDto> {
        try {
            return new UserDto(await this.usersService.acceptInvitationAndCreateMember(user));
        } catch (exception) {
            throw new HttpException('Error during accept invitation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
