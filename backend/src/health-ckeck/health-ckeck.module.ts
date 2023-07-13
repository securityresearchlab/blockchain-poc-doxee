import { Module } from '@nestjs/common';
import { HealthCkeckService } from './health-ckeck.service';
import { HealthCkeckController } from './health-ckeck.controller';

@Module({
  controllers: [HealthCkeckController],
  providers: [HealthCkeckService]
})
export class HealthCkeckModule {}
