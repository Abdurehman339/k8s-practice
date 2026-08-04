import { Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
const { combine, timestamp, json, colorize, printf } = format;

// Custom format for console logging with colors
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

@Injectable()
export default class WinstonLoggerService {
  private readonly logger: Logger = createLogger({
    level: 'info',
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat,
      json(),
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/app.log' }),
    ],
  });

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.logger.error({ message, trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }

  info(message: string) {
    this.logger.info(message);
  }
}
