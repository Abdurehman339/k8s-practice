import { Injectable, NestMiddleware } from '@nestjs/common';
import * as sanitizer from 'sanitizer';
import { TRequest } from 'utils/interfaces/t-request';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: TRequest, res: Response, next: Function) {
    // Sanitize incoming request body, query, and params
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }

    next();
  }

  // Recursively sanitize object or string
  private sanitizeObject(data: any) {
    if (typeof data === 'string') {
      return sanitizer.escape(data); // Escape potentially dangerous characters
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeObject(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitizedData: any = {};
      Object.keys(data).forEach((key) => {
        sanitizedData[key] = this.sanitizeObject(data[key]);
      });
      return sanitizedData;
    }

    return data; // If not a string or object, return as is
  }
}
