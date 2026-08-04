import { INestApplication } from '@nestjs/common';
import { AppConfig } from 'src/config';

export default function SetGlobalPrefix(app: INestApplication) {
  app.setGlobalPrefix(AppConfig.app.prefix);
}
