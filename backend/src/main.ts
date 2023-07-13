import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MetadataStorage, getFromContainer } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { writeFileSync } from 'fs';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({logger: true}), {cors: true});

  const configService = app.get(ConfigService);
  // Import server configuration
  const serverUrl = configService.get<string>("URL");
  const serverPort = configService.get<number>("PORT");

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
      .setTitle("Doxee APIs")
      .setDescription("Doxee APIs to upload files into Hyperledger Fabric v2 blockchain")
      .setVersion("0")
      .addServer(serverUrl)
      .build()
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerMetadatas = (getFromContainer(MetadataStorage) as any).validationMetadatas;
  const swaggerSchemas = validationMetadatasToSchemas(swaggerMetadatas) as any;
  
  swaggerDocument.components.schemas = (swaggerDocument && swaggerDocument.components) ? 
      swaggerSchemas : swaggerDocument.components.schemas;
  
  SwaggerModule.setup("api", app, swaggerDocument);

  // OpenAPI file generation only
  const generateOpenAPIOnly = process.argv.includes("openapionly=true");
  if (generateOpenAPIOnly) {
    writeFileSync(configService.get("OPENAPI_FILE_NAME"), JSON.stringify(swaggerDocument), {encoding: "utf8"});
    await app.close();
  } else {
      // Start server
      await app.listen(serverPort);
  }
}

bootstrap();
