import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default function InjectSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Appcrops Server')
    .setDescription('Appcrops API')
    // .setContact('Khizer Hussain', '', 'khizwaseem@gmail.com')
    .setContact('Techverticks', '', 'techversatile2025@gmail.com')
    .setVersion('1.0')
    .addTag('API', 'Documentation')
    .addBearerAuth(
      {
        name: 'Authorization',
        type: 'http',
        bearerFormat: 'JWT',
        scheme: 'bearer',
        in: 'header',
      },
      'auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-ui', app, document);
}
