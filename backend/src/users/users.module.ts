import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user';
import { AuthCodeModule } from 'src/auth-code/auth-code.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthCodeModule
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
