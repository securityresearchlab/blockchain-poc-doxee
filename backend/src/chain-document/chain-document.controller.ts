import {Body, Controller, Get, HttpCode, Logger, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {ApiBearerAuth, ApiConsumes, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Request} from 'express';
import {diskStorage} from 'multer';
import {JwtAuthGuard} from 'src/auth/guard/jwt-auth.guard';
import {TransactionDto} from 'src/chain-document/dto/transaction-dto';
import {ReqUser} from 'src/users/decorators/users.decorator';
import {User} from 'src/users/entities/user';
import {ChainDocumentService} from './chain-document.service';
import {ChainDocumentDto} from './dto/chain-document-dto';
import {ChaindocumentUploadDto} from './dto/chain-document-upload-dto';
import {FastifySingleFileInterceptor} from './interceptors/fastify-single-file.interceptor';
import {editFileName, fileFilter} from './utils/file-upload.util';
import {fileMapper} from './mapper/file.mapper';
import {ChainDocumentBody} from './decorators/chain-document-body.decorator';

@ApiTags('chain-documents')
@Controller('/api/v0/secure/chain-document')
export class ChainDocumentController {
  private readonly logger = new Logger(ChainDocumentController.name);

  constructor(private chainDocumentService: ChainDocumentService) {}

  @Post('init')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async init(): Promise<void> {
    return await this.chainDocumentService.init();
  }

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({type: Array<ChainDocumentDto>, isArray: true})
  async getAll(@ReqUser() user: User): Promise<Array<ChainDocumentDto>> {
    try {
      return (await this.chainDocumentService.findAll(user)).map((doc) => new ChainDocumentDto(doc));
    } catch (err) {
      this.logger.warn(JSON.stringify(err));
      throw err;
    }
  }

  @Get(':id')
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ChainDocumentBody()
  @UseInterceptors(
    FastifySingleFileInterceptor('file', {
      storage: diskStorage({
        destination: '../uploads',
        filename: editFileName,
      }),
      fileFilter: fileFilter,
    }),
  )
  @ApiResponse({type: TransactionDto})
  async uploadChainDocument(
    @ReqUser() user: User,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() chaindocumentUploadDto: ChaindocumentUploadDto,
  ): Promise<TransactionDto> {
    chaindocumentUploadDto.url = fileMapper({file, req}).url;
    return await this.chainDocumentService.uploadDocument(user, chaindocumentUploadDto, file);
  }
}
