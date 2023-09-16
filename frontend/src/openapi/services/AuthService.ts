/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginUserDto } from '../models/LoginUserDto';
import type { SignUpUserDto } from '../models/SignUpUserDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * @param requestBody
     * @returns any User authenticated successfully.
     * @throws ApiError
     */
    public static authControllerLogin(
        requestBody: LoginUserDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v0/secure/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Credentials are invalid.`,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any User created successfully.
     * @throws ApiError
     */
    public static authControllerSignUp(
        requestBody: SignUpUserDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v0/secure/auth/signUp',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `Error during registration process.`,
            },
        });
    }

}
