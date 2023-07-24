/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * @returns any
     * @throws ApiError
     */
    public static healthCkeckControllerCheck(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v0/health-ckeck',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static authCodeControllerFindAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v0/auth-code/all',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static authCodeControllerFindAllValid(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v0/auth-code/valid',
        });
    }

}
