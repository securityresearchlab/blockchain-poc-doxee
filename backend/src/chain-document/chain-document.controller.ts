import { Body, Controller, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChainDocumentService } from './chain-document.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ChainDocumentDto } from './dto/chain-document-dto';
import { ReqUser } from 'src/users/decorators/users.decorator';
import { User } from 'src/users/entities/user';
import { TransactionDto } from 'src/chain-document/dto/transaction-dto';
import { File } from 'buffer';

@ApiTags("chain-documents")
@Controller('/api/v0/secure/chain-document')
export class ChainDocumentController {
    private readonly logger = new Logger(ChainDocumentController.name);

    constructor(private chainDocumentService: ChainDocumentService) {}

    @Get('all')
    @UseGuards(JwtAuthGuard)
    @ApiResponse({type: Array<ChainDocumentDto>, isArray: true})
    async getAll(@ReqUser() user: User): Promise<Array<ChainDocumentDto>> {
        try {
            return (await this.chainDocumentService.findAll(user))
                .map(doc => new ChainDocumentDto(doc));  
        } catch (err) {
            this.logger.warn(JSON.stringify(err));
            throw err;
        }
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiResponse({type: ChainDocumentDto})
    async getOneById(@ReqUser() user: User, @Param('id') id: string): Promise<ChainDocumentDto> {
        try {
            return new ChainDocumentDto(await this.chainDocumentService.findOne(user, id));  
        } catch (err) {
            this.logger.warn(JSON.stringify(err));
            throw err;
        }
    }


    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @ApiResponse({type: TransactionDto})
    async uploadChainDocument(@ReqUser() user: User, @Body() file: File): Promise<TransactionDto> {
        return await this.chainDocumentService.uploadDocument(user, file);
    }
}
