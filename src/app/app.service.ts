import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppStarted(): string {
    return ('API services for simple product payment!');
  }
}
