import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios'; 

declare namespace Components {
    namespace Schemas {
        export interface LoginUserDto {
            email: string;
            code?: any;
        }
        export interface SignUpUserDto {
            name: string;
            surname: string;
            organization: string;
            email: string; // ^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$
        }
    }
}
declare namespace Paths {
    namespace AuthCodeControllerFindAll {
        namespace Responses {
            export interface $200 {
            }
        }
    }
    namespace AuthCodeControllerFindAllValid {
        namespace Responses {
            export interface $200 {
            }
        }
    }
    namespace AuthControllerSignIn {
        export type RequestBody = Components.Schemas.LoginUserDto;
        namespace Responses {
            export interface $200 {
            }
            export interface $401 {
            }
        }
    }
    namespace AuthControllerSingUp {
        export type RequestBody = Components.Schemas.SignUpUserDto;
        namespace Responses {
            export interface $200 {
            }
            export interface $500 {
            }
        }
    }
    namespace HealthCkeckControllerCheck {
        namespace Responses {
            export interface $200 {
            }
        }
    }
}

export interface OperationMethods {
  /**
   * HealthCkeckController_check
   */
  'HealthCkeckController_check'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.HealthCkeckControllerCheck.Responses.$200>
  /**
   * AuthController_signIn
   */
  'AuthController_signIn'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.AuthControllerSignIn.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AuthControllerSignIn.Responses.$200>
  /**
   * AuthController_singUp
   */
  'AuthController_singUp'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.AuthControllerSingUp.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AuthControllerSingUp.Responses.$200>
  /**
   * AuthCodeController_findAll
   */
  'AuthCodeController_findAll'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AuthCodeControllerFindAll.Responses.$200>
  /**
   * AuthCodeController_findAllValid
   */
  'AuthCodeController_findAllValid'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AuthCodeControllerFindAllValid.Responses.$200>
}

export interface PathsDictionary {
  ['/api/v0/health-ckeck']: {
    /**
     * HealthCkeckController_check
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.HealthCkeckControllerCheck.Responses.$200>
  }
  ['/api/v0/secure/auth/login']: {
    /**
     * AuthController_signIn
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.AuthControllerSignIn.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AuthControllerSignIn.Responses.$200>
  }
  ['/api/v0/secure/auth/signUp']: {
    /**
     * AuthController_singUp
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.AuthControllerSingUp.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AuthControllerSingUp.Responses.$200>
  }
  ['/api/v0/auth-code/all']: {
    /**
     * AuthCodeController_findAll
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AuthCodeControllerFindAll.Responses.$200>
  }
  ['/api/v0/auth-code/valid']: {
    /**
     * AuthCodeController_findAllValid
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AuthCodeControllerFindAllValid.Responses.$200>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
