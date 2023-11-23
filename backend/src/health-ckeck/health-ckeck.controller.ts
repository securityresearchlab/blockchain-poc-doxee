import {Controller, Get} from '@nestjs/common';
import {HealthCkeckService} from './health-ckeck.service';

@Controller('/api/v0/health-ckeck')
export class HealthCkeckController {
  constructor(private readonly healthCkeckService: HealthCkeckService) {}

  @Get()
  check() {
    return this.healthCkeckService.check();
  }
}
