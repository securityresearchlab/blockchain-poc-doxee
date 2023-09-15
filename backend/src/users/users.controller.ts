import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("users")
@Controller('/api/v0/secure/users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(
        private usersService: UsersService
    ) {}

    @Get(":email")
    @UseGuards(JwtAuthGuard)
    async getUser(@Param('email') email: string) {
        return await this.usersService.findOne(email);
    }

    @Get("generateNewProposal/:email")
    @UseGuards(JwtAuthGuard)
    async generateNewProposal(@Param("email") email: string) {
        return await this.usersService.generateNewProposal(email);
    }
}
