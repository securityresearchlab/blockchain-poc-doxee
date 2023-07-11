export class User {
    name?: string;
    surname?: string;
    organization?: string;
    email?: string;

    constructor(name: string, surname: string, organization: string, email: string) {
        this.name = name;
        this.surname = surname;
        this.organization = organization;
        this.email = email;
    }
}