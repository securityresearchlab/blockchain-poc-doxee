/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type NodeDto = {
    nodeId: string;
    creationDate: string;
    status: NodeDto.status;
};

export namespace NodeDto {

    export enum status {
        CREATING = 'CREATING',
        AVAILABLE = 'AVAILABLE',
        UNHEALTHY = 'UNHEALTHY',
        CREATE_FAILED = 'CREATE_FAILED',
        UPDATING = 'UPDATING',
        DELETING = 'DELETING',
        DELETED = 'DELETED',
        FAILED = 'FAILED',
        INACCESSIBLE_ENCRYPTION_KEY = 'INACCESSIBLE_ENCRYPTION_KEY',
    }


}

