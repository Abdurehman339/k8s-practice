import { INestApplication } from '@nestjs/common';
import * as compression from 'compression';

export default function InjectCompression(app: INestApplication) {
  app.use(
    compression({
      threshold: 512, // set the threshold to 512 bytes
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    }),
  );
}
