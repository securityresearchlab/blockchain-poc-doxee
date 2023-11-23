export const configuration = () => ({
  APP_MODE: process.env.APP_MODE,
  NODE_ENV: process.env.NODE_ENV,
  URL: process.env.URL ?? 'http://localhost:8888',
  PORT: parseInt(process.env.PORT ?? '8888', 10),
  DB: process.env.DB,
  OPENAPI_FILE_NAME: process.env.OPENAPI_FILE_NAME ?? 'doxee-openapi.json',
  JWT_SECRET: process.env.JWT_SECRET,
  MAIL_HOST: process.env.MAIL_HOST,
  SMTP_USERNAME: process.env.SMTP_USERNAME,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  AWS_NETWORK_ID: process.env.AWS_NETWORK_ID,
  AWS_MEMBER_ID: process.env.AWS_MEMBER_ID,
});
