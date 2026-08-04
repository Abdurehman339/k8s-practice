import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export default function InjectHelmet(app: INestApplication) {
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
      },
    }),
  );
}
