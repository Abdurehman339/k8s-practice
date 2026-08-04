import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('Application')
export class AppController {
  constructor(private readonly _app: AppService) {}

  @Get()
  get(): string {
    return this._app.get();
  }
}
