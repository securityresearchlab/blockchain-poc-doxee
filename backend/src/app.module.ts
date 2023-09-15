import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthCodeModule } from './auth-code/auth-code.module';
import { AuthCode } from './auth-code/entities/auth-code';
import { AuthModule } from './auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { HealthCkeckModule } from './health-ckeck/health-ckeck.module';
import { MailModule } from './mail/mail.module';
import { User } from './users/entities/user';
import { UsersModule } from './users/users.module';
import { Proposal } from './blockchain/entities/proposal';
import { Invitation } from './blockchain/entities/invitation';

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
        entities: [User, AuthCode, Proposal, Invitation],
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
