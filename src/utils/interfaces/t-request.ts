import { User } from '@prisma/client';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';

export interface TRequest extends Request {
  rawBody?: Buffer | ArrayLike<Buffer>;
  user?: Partial<User>;
  user_id?: string;
  token?: string;
  ['x-refresh-token']?: string;
  headers: IncomingHttpHeaders;
  [key: string]: any;
}
