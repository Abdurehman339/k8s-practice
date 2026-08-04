import { INestApplication } from '@nestjs/common';

export default function EnableCors(app: INestApplication) {
  app.enableCors({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    origin: ['http://localhost:5173'],
    allowedHeaders: '*',
  });
}
