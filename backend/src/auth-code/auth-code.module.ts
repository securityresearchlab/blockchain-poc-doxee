import { Module } from '@nestjs/common';
import { AuthCodeService } from './auth-code.service';
import { AuthCodeController } from './auth-code.controller';
import { AuthCode } from './entities/auth-code';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user';

@Module({
  imports: [TypeOrmModule.forFeature([AuthCode, User])],
  providers: [AuthCodeService],
  controllers: [AuthCodeController],
  exports: [AuthCodeService],
})
export class AuthCodeModule {}
