import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { HealthCkeckModule } from './health-ckeck/health-ckeck.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user';
import { AuthCode } from './auth-code/entities/auth-code';
import { AuthCodeModule } from './auth-code/auth-code.module';
import { MailModule } from './mail/mail.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `src/config/env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
      load: [configuration],
      validationSchema: validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get("DB"),
        entities: [User, AuthCode],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    HealthCkeckModule,
    AuthModule,
    UsersModule,
    AuthCodeModule,
    MailModule,
    BlockchainModule,
  ],
})
export class AppModule {}
