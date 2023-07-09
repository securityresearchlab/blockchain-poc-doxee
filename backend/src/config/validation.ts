import * as Joi from "joi";

export const validationSchema = Joi.object({
    NODE_ENV: Joi.string().valid("development", "test", "production"),
    URL: Joi.string().required(),
    PORT: Joi.number().default(8888),
    OPENAPI_FILE_NAME: Joi.string().required(),
})
