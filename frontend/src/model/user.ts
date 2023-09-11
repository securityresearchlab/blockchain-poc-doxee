export class User {
    name?: string;
    surname?: string;
    organization?: string;
    awsClientId?: string;
    proposalId?: string;
    email?: string;

    constructor(name: string, surname: string, organization: string, awsClientId: string, proposalId: string, email: string) {
        this.name = name;
        this.surname = surname;
        this.organization = organization;
        this.awsClientId = awsClientId;
        this.proposalId = proposalId;
        this.email = email;
    }
}