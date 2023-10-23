import { File } from "buffer";
import { IsNotEmpty } from "class-validator";

export class ChaindocumentUploadDto {
    @IsNotEmpty()
    owner: string;
}