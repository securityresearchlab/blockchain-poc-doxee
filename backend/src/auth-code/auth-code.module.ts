import {Global, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthCodeController} from './auth-code.controller';
import {AuthCodeService} from './auth-code.service';
import {AuthCode} from './entities/auth-code';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuthCode])],
  providers: [AuthCodeService],
  controllers: [AuthCodeController],
  exports: [AuthCodeService],
})
export class AuthCodeModule {}
