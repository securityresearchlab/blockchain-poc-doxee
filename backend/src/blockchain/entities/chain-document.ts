import { Blob } from "buffer";

export class ChainDocument {
    id: string;
    name: string;
    buffer: Blob;
    uploadDate: Date;
}