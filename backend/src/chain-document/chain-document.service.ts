import { Injectable, Logger } from '@nestjs/common';
import { ChaincodeService } from 'src/blockchain/chiancode.service';
import { User } from 'src/users/entities/user';
import { ChainDocument } from './entity/chain-document';

@Injectable()
export class ChainDocumentService {
    private readonly logger = new Logger(ChainDocumentService.name);

    constructor(private chaincodeService: ChaincodeService) {}

    async findAll(user: User): Promise<Array<ChainDocument>> {
        return (await this.chaincodeService.query(user, 'getAll', []))
            .map(doc => new ChainDocument(doc));
    }

    async findOne(user: User, id: string): Promise<ChainDocument> {
        return (await this.chaincodeService.query(user, 'get', [JSON.stringify({id: id})]))
            .map(doc => new ChainDocument(doc))?.at(0);
    }   
}
