import {ApiBody} from '@nestjs/swagger';

/**
 * This decorator is needed in order to generate the correct body client
 * @param fileName
 * @returns
 */
export const ChainDocumentBody =
  (fileName: string = 'file'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
          },
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })(target, propertyKey, descriptor);
  };
