import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { User } from './entities/user';
import { UsersController } from './users.controller';
import { UsersRepositoryService } from './users.repository.service';
import { UsersService } from './users.service';
import { Invitation } from 'src/blockchain/entities/invitation';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Invitation]),
    BlockchainModule
  ],
  providers: [UsersService, UsersRepositoryService],
  exports: [UsersService, UsersRepositoryService],
  controllers: [UsersController],
})
export class UsersModule {}
