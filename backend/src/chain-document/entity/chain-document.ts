export class ChainDocument {
  id: string;
  name: string;
  owner: string;
  buffer: ArrayBuffer;
  uploadDate: Date;

  constructor(partial: Partial<any>) {
    Object.assign(this, partial);
  }
}
