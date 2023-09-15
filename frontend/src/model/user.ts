import { Proposal } from "./proposal";

export class User {
    name: string;
    surname: string;
    organization: string;
    awsClientId: string;
    email: string;
    proposals?: Array<Proposal>;

    constructor(name: string, surname: string, organization: string, awsClientId: string, email: string, proposals: Array<Proposal>) {
        this.name = name;
        this.surname = surname;
        this.organization = organization;
        this.awsClientId = awsClientId;
        this.email = email;
        this.proposals = proposals;
    }
}