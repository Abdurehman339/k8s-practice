import { Injectable, NestMiddleware } from '@nestjs/common';
const morgan = require('morgan');
import WinstonLoggerService from './winston-logger';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: WinstonLoggerService) {}

  use(req: any, res: any, next: any): void {
    const morganFormat =
      ':method :url :status :response-time ms - :res[content-length] - :remote-addr - :user-agent';

    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : req.ip;

    // Wrap morgan to capture base request info
    morgan(morganFormat, {
      stream: {
        write: (message: string) => {
          const logObject: Record<string, any> = {
            method: req.method,
            code: res.statusCode,
            route: req.originalUrl,
            time: `${message.split(' ')[3]} ms`,
            ip: clientIp,
            host: req.headers['host'],
            length: message.split(' ')[6],
            device: message.split('  ')[10],
            body: req.body ? JSON.stringify(req.body, null, 1) : undefined,
            params: req.params
              ? JSON.stringify(req.params, null, 1)
              : undefined,
            query: req.query ? JSON.stringify(req.query, null, 1) : undefined,
            bearer:
              req.headers['authorization']?.replace('Bearer ', '') || undefined,
          };

          // Attach error info later if available
          if (res.locals && res.locals.error) {
            logObject['error'] = res.locals.error.message;
            logObject['trace'] = res.locals.error.stack;
          }

          console.table(logObject);
          // this.logger.info(JSON.stringify(logObject));
        },
      },
    })(req, res, next);

    /**
     * Listen for errors at response level
     * (e.g., thrown exceptions in controllers).
     */
    res.on('finish', () => {
      if (res.statusCode >= 400 && res.locals?.error) {
        const err = res.locals.error;
        this.logger.error(
          `HTTP ${res.statusCode} - ${req.method} ${req.originalUrl}`,
          err.stack || err.message,
        );
      }
    });

    res.on('error', (err: any) => {
      res.locals.error = err;
      this.logger.error(
        `HTTP ERROR - ${req.method} ${req.originalUrl}`,
        err.stack || err.message,
      );
    });
  }
}
