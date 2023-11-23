import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // APP_MODE must correspond to AppModeEnum
  APP_MODE: Joi.string().valid('INVITATION', 'CLIENT'),
  NODE_ENV: Joi.string().valid('development', 'test', 'production'),
  URL: Joi.string().required(),
  PORT: Joi.number().default(8888),
  DB: Joi.string().required(),
  OPENAPI_FILE_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  MAIL_HOST: Joi.string().required(),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  AWS_NETWORK_ID: Joi.string().required(),
  AWS_MEMBER_ID: Joi.string().required(),
});
