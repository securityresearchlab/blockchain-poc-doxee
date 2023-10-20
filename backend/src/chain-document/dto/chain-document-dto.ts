import { IsDate, IsNotEmpty } from "class-validator";
import { ChainDocument } from "../entity/chain-document";

export class ChainDocumentDto {
    @IsNotEmpty()
    id: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsDate()
    uploadDate: Date;

    constructor(partial: Partial<ChainDocument>) {
        Object.assign(this, partial);
    }
}