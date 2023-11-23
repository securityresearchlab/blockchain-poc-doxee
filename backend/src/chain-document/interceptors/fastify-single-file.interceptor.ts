import {CallHandler, ExecutionContext, Inject, NestInterceptor, Optional, Type, mixin} from '@nestjs/common';
import FastifyMulter from 'fastify-multer';
import {Multer, Options} from 'multer';
import {Observable} from 'rxjs';

/**
 * Interceptor for a single file upload
 * @param fieldName
 * @param localOptions
 * @returns
 */
export function FastifySingleFileInterceptor(fieldName: string, localOptions: Options): Type<NestInterceptor> {
  type MulterInstance = any;
  class MixinInterceptor implements NestInterceptor {
    protected multer: MulterInstance;

    constructor(
      @Optional()
      @Inject('MULTER_MODULE_OPTIONS')
      options: Multer,
    ) {
      this.multer = (FastifyMulter as any)({...options, ...localOptions});
    }

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
      const ctx = context.switchToHttp();

      await new Promise<void>((resolve, reject) =>
        this.multer.single(fieldName)(ctx.getRequest(), ctx.getResponse(), (error: any) => {
          if (error) return reject(error);
          resolve();
        }),
      );

      return next.handle();
    }
  }
  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}
