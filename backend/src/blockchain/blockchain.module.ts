import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { AwsSdkModule } from 'nest-aws-sdk';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EC2, EC2InstanceConnect, ManagedBlockchain } from 'aws-sdk';

@Module({
  imports: [
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (cs: ConfigService) => {
          return {
            region: cs.get('AWS_REGION').substring(0, cs.get('AWS_REGION').length - 1),
          };
        },
      },
      services: [
        EC2,
        EC2InstanceConnect,
        ManagedBlockchain,
      ]
    }),
  ],
  providers: [BlockchainService],
  exports: [BlockchainService]
})
export class BlockchainModule {}
