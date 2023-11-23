import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {UsersModule} from 'src/users/users.module';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {PassportModule} from '@nestjs/passport';
import {AuthCodeModule} from 'src/auth-code/auth-code.module';
import {LocalStrategy} from './strategy/local.strategy';
import {JwtStrategy} from './strategy/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    AuthCodeModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        // Token expires after 4 hours (14.400 seconds)
        signOptions: {expiresIn: '14400s'},
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
