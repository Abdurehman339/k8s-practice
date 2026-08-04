import { INestApplication, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GlobalExceptionFilter } from 'utils/exception';

export default function InjectionGlobalException(app: INestApplication) {
  const httpAdapterHost = app.get(HttpAdapterHost);
  const logger = app.get(Logger);

  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost, logger));
}
