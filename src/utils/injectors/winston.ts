import { INestApplication } from '@nestjs/common';
import { PrismaLogger } from 'src/helpers/logger.helper';
import WinstonLoggerService from 'utils/middlewares/winston-logger';

export default function InjectWinstorLogger(app: INestApplication) {
  // app.useLogger(app.get(WinstonLoggerService));
  app.use(PrismaLogger.middleware());
}
