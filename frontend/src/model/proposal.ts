export class Proposal {
    proposalId: string;
    creationDate: Date;
    expirationDate: Date;
    status: string;

    constructor(proposalObj: any) {
        this.proposalId = proposalObj?.proposalId;
        this.creationDate = proposalObj?.creationDate;
        this.expirationDate = proposalObj?.expirationDate;
        this.status = proposalObj?.status;
    }
}