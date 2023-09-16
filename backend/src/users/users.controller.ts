import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Proposal } from 'src/blockchain/entities/proposal';
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

    @Get(":email")
    @UseGuards(JwtAuthGuard)
    @ApiResponse({type: UserDto})
    async getUser(@Param('email') email: string): Promise<User> {
        return await this.usersService.findOne(email);
    }

    @Get("generateNewProposal/:email")
    @UseGuards(JwtAuthGuard)
    @ApiResponse({type: ProposalDto})
    async generateNewProposal(@Param("email") email: string): Promise<Proposal> {
        return await this.usersService.generateNewProposal(email);
    }
}
