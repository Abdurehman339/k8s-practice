import { INestApplication } from '@nestjs/common';
import * as hpp from 'hpp';

export default function InjectHPP(app: INestApplication) {
  app.use(hpp());
}
