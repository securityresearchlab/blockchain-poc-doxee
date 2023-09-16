/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type InvitationDto = {
    invitationId: string;
    creationDate: string;
    expirationDate: string;
    status: InvitationDto.status;
};

export namespace InvitationDto {

    export enum status {
        PENDING = 'PENDING',
        ACCEPTING = 'ACCEPTING',
        ACCEPTED = 'ACCEPTED',
        REJECTED = 'REJECTED',
        EXPIRED = 'EXPIRED',
    }


}

