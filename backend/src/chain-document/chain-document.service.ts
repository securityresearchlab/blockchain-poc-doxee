import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ChaincodeService } from 'src/blockchain/chiancode.service';
import { TransactionDto } from 'src/chain-document/dto/transaction-dto';
import { User } from 'src/users/entities/user';
import { UsersService } from 'src/users/users.service';
import { ChaindocumentUploadDto } from './dto/chain-document-upload-dto';
import { ChainDocument } from './entity/chain-document';


@Injectable()
export class ChainDocumentService {
    private readonly logger = new Logger(ChainDocumentService.name);

    constructor(
        private chaincodeService: ChaincodeService,
        private usersService: UsersService,
    ) {}

    async init(): Promise<void> {
        try {
            await this.chaincodeService.installChaincode('documents');
        } catch (err) {
            this.logger.warn(err);
            throw new HttpException('Error during chaincode init', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(user: User): Promise<Array<ChainDocument>> {
        user = await this.usersService.findOne(user.email);
        this.logger.log(`Start searching all documents for user ${user.id}`);
        return (await this.chaincodeService.query(user, 'getAll', []))
            .map(doc => new ChainDocument(doc));
    }

    async findOne(user: User, id: string): Promise<ChainDocument> {
        user = await this.usersService.findOne(user.email);
        this.logger.log(`Start searching document ${id} for user ${user.id}`);
        return (await this.chaincodeService.query(user, 'get', [JSON.stringify({id: id})]))
            .map(doc => new ChainDocument(doc))?.at(0);
    }   

    async uploadDocument(user: User, chaindocumentUploadDto: ChaindocumentUploadDto, file: Express.Multer.File): Promise<TransactionDto> {
        user = await this.usersService.findOne(user.email);
        this.logger.log(`Start uplaoding document ${file.originalname} for user ${user.id}`);
        let document = new ChainDocument({
            id: randomUUID(),
            name: file.originalname,
            owner: chaindocumentUploadDto.owner,
            url: chaindocumentUploadDto.url,
            buffer: file.buffer,
            uploadDate: new Date(),
        });
        return (await this.chaincodeService.invoke(user, 'POST', [JSON.stringify(document)]))
    }
}
