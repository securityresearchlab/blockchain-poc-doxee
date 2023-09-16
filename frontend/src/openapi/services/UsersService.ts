/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProposalDto } from '../models/ProposalDto';
import type { UserDto } from '../models/UserDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * @returns UserDto
     * @throws ApiError
     */
    public static usersControllerGetUser(): CancelablePromise<UserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v0/secure/users',
        });
    }

    /**
     * @returns ProposalDto
     * @throws ApiError
     */
    public static usersControllerGenerateNewProposal(): CancelablePromise<ProposalDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v0/secure/users/generateNewProposal',
        });
    }

    /**
     * @returns UserDto
     * @throws ApiError
     */
    public static usersControllerAcceptInvitation(): CancelablePromise<UserDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v0/secure/users/acceptInvitation',
        });
    }

}
