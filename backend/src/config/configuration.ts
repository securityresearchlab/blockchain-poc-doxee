export const configuration = () => ({
    NODE_ENV: process.env.NODE_ENV,
    URL: process.env.URL ?? "http://localhost:8888",
    PORT: parseInt(process.env.PORT ?? "8888", 10),
    DB: process.env.DB,
    OPENAPI_FILE_NAME: process.env.OPENAPI_FILE_NAME ?? "doxee-openapi.json",
    JWT_SECRET: process.env.JWT_SECRET,
})