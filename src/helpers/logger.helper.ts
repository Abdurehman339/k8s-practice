import * as Chalk from 'chalk';
const morgan = require('morgan');
import { AppConfig } from 'src/config';

export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
}

export class PrismaLogger {
  private static template = {
    [LogLevel.TRACE]: Chalk.greenBright,
    [LogLevel.DEBUG]: Chalk.whiteBright,
    [LogLevel.INFO]: Chalk.blueBright,
    [LogLevel.WARN]: Chalk.magenta,
    [LogLevel.ERROR]: Chalk.redBright,
    [LogLevel.FATAL]: Chalk.bgRed,
  };

  private static loggerMiddleware: Function = null;

  private static log(level: LogLevel, data: any, tag?: string) {
    if (AppConfig.app.log.level > level) {
      return;
    }

    if (typeof data === 'object') {
      let str = JSON.stringify(data, null, 4);
      if (str != '{}') {
        data = str;
      }
    }

    if (tag !== undefined) {
      console.log(Chalk.bold.underline.white(tag), this.template[level](data));
    } else {
      console.log(this.template[level](data));
    }
  }

  public static trace(data: any, tag?: string) {
    this.log(LogLevel.TRACE, data, tag);
  }
  public static debug(data: any, tag?: string) {
    this.log(LogLevel.DEBUG, data, tag);
  }
  public static info(data: any, tag?: string) {
    this.log(LogLevel.INFO, data, tag);
  }
  public static warn(data: any, tag?: string) {
    this.log(LogLevel.WARN, data, tag);
  }
  public static error(data: any, tag?: string) {
    this.log(LogLevel.ERROR, data, tag);
  }
  public static fatal(data: any, tag?: string) {
    this.log(LogLevel.FATAL, data, tag);
  }

  public static middleware() {
    if (PrismaLogger.loggerMiddleware === null) {
      let LoggerFormatStr =
        ':date[iso] :method :status :response-time ms :res[content-length] :remote-addr :url :referrer :user-agent';

      if (AppConfig.app.debug) {
        morgan.token('authorization', (req: any, res: any): string => {
          return req.headers['authorization'] as string;
        });

        morgan.token('body', (req: any, res: any) => {
          return req.body ? JSON.stringify(req.body, null, 4) : '';
        });

        morgan.token('query', (req: any, res: any): string => {
          return req.query ? JSON.stringify(req.query, null, 4) : '';
        });

        morgan.token('params', (req: any, res: any): string => {
          return req.params ? JSON.stringify(req.params, null, 4) : '';
        });

        morgan.token('responsebody', (req: any, res: any): string => {
          let str = '';

          if ((res as any).__ss_body) {
            try {
              // to avoid runtime exception for not json response
              str = JSON.stringify((res as any).__ss_body, null, 4);
            } catch (e) {
              str = (res as any).__ss_body;
            }
          }
          return str;
        });

        LoggerFormatStr =
          '[API] :date[iso] :method :status :response-time ms :res[content-length] :remote-addr :url :referrer :user-agent\nPath Params :params\nQuery Params :query\nRequest Body :body\nResponse Body :responsebody';
      }

      PrismaLogger.loggerMiddleware = morgan(LoggerFormatStr, {
        stream: {
          write: (str) => {
            this.info(str);
          },
        },
      });
    }

    return PrismaLogger.loggerMiddleware;
  }
}
