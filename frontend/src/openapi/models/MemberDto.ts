/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MemberDto = {
    memberId: string;
    name: string;
    creationDate: string;
    isOwned: string;
    status: MemberDto.status;
};

export namespace MemberDto {

    export enum status {
        CREATING = 'CREATING',
        AVAILABLE = 'AVAILABLE',
        CREATE_FAILED = 'CREATE_FAILED',
        UPDATING = 'UPDATING',
        DELETING = 'DELETING',
        DELETED = 'DELETED',
        INACCESSIBLE_ENCRYPTION_KEY = 'INACCESSIBLE_ENCRYPTION_KEY',
    }


}

