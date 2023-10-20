import { Blob } from "buffer";

export class ChainDocument {
    id: string;
    name: string;
    buffer: Blob;
    uploadDate: Date;

    constructor(partial: Partial<Object>) {
        Object.assign(this, partial);
    }
}