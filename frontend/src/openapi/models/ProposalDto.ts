/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ProposalDto = {
    proposalId: string;
    creationDate: string;
    expirationDate: string;
    status: ProposalDto.status;
};

export namespace ProposalDto {

    export enum status {
        IN_PROGRESS = 'IN_PROGRESS',
        APPROVED = 'APPROVED',
        REJECTED = 'REJECTED',
        EXPIRED = 'EXPIRED',
        ACTION_FAILED = 'ACTION_FAILED',
    }


}

