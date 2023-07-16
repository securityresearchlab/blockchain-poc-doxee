import { Module } from '@nestjs/common';
import { AuthCodeService } from './auth-code.service';
import { AuthCodeController } from './auth-code.controller';
import { AuthCode } from './entities/auth-code';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AuthCode])],
  providers: [AuthCodeService],
  controllers: [AuthCodeController],
})
export class AuthCodeModule {}
