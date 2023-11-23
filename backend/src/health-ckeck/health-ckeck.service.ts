import {Injectable} from '@nestjs/common';

@Injectable()
export class HealthCkeckService {
  check() {
    return `OK`;
  }
}
