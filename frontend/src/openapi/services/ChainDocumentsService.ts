/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChainDocumentDto } from '../models/ChainDocumentDto';
import type { TransactionDto } from '../models/TransactionDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ChainDocumentsService {

    /**
     * @returns any[]
     * @throws ApiError
     */
    public static chainDocumentControllerGetAll(): CancelablePromise<Array<any[]>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v0/secure/chain-document/all',
        });
    }

    /**
     * @param id
     * @returns ChainDocumentDto
     * @throws ApiError
     */
    public static chainDocumentControllerGetOneById(
        id: string,
    ): CancelablePromise<ChainDocumentDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v0/secure/chain-document/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns TransactionDto
     * @throws ApiError
     */
    public static chainDocumentControllerUploadChainDocument(): CancelablePromise<TransactionDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v0/secure/chain-document/upload',
        });
    }

}
