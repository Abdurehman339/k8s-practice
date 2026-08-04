import { INestApplication, Logger } from '@nestjs/common';
import SetTrustProxy from './set-proxy';
import SetGlobalPrefix from './set-prefix';
import EnableCors from './cors';
import InjectPipes from './pipes';
import InjectWinstorLogger from './winston';
import InjectionGlobalException from './exception-filter';
import InjectSwagger from './swagger';
import InjectCompression from './compression';
import InjectHelmet from './helmet';
import InjectHPP from './hpp';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppConfig } from 'src/config';

export const AppConfiguration = (
  app: INestApplication,
  adapter: ExpressAdapter,
) => {
  SetGlobalPrefix(app);
  SetTrustProxy(adapter);
  EnableCors(app);
  InjectCompression(app);
  InjectPipes(app);
  InjectWinstorLogger(app);
  InjectionGlobalException(app);
  InjectSwagger(app);
  InjectHelmet(app);
  InjectHPP(app);
};

export const RunServer = async (app: INestApplication) => {
  await app.listen(AppConfig.app.port, '0.0.0.0');
  Logger.log(`Server running on ${AppConfig.app.route}`);
};
