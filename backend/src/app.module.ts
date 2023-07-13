import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { HealthCkeckModule } from './health-ckeck/health-ckeck.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `src/config/env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
      load: [configuration],
      validationSchema: validationSchema,
    }),
    HealthCkeckModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
