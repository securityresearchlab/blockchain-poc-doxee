import { Body, Controller, Get, Logger, MaxFileSizeValidator, Param, ParseFilePipe, Post, UploadedFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { TransactionDto } from 'src/chain-document/dto/transaction-dto';
import { ReqUser } from 'src/users/decorators/users.decorator';
import { User } from 'src/users/entities/user';
import { ChainDocumentService } from './chain-document.service';
import { ChainDocumentDto } from './dto/chain-document-dto';
import { ChaindocumentUploadDto } from './dto/chain-document-upload-dto';

@ApiTags("chain-documents")
@Controller('/api/v0/secure/chain-document')
export class ChainDocumentController {
    private readonly logger = new Logger(ChainDocumentController.name);

    constructor(private chainDocumentService: ChainDocumentService) {}

    @Get('all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
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
    @ApiBearerAuth()
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
    @ApiBearerAuth()
    @ApiBody({type: ChaindocumentUploadDto})
    @ApiResponse({type: TransactionDto})
    async uploadChainDocument(
        @ReqUser() user: User, 
        @Body() chaindocumentUploadDto: ChaindocumentUploadDto, 
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({maxSize: 10000}),
            ]
        })) file: Express.Multer.File) : Promise<TransactionDto> {
            return await this.chainDocumentService.uploadDocument(user, chaindocumentUploadDto, file);
    }
}
