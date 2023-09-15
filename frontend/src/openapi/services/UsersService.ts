/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * @param email
     * @returns any
     * @throws ApiError
     */
    public static usersControllerGetUser(
        email: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v0/secure/users/{email}',
            path: {
                'email': email,
            },
        });
    }

    /**
     * @param email
     * @returns any
     * @throws ApiError
     */
    public static usersControllerGenerateNewProposal(
        email: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v0/secure/users/generateNewProposal/{email}',
            path: {
                'email': email,
            },
        });
    }

}
