import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppConfiguration, RunServer } from './utils/injectors';

async function bootstrap() {
  const adapter = new ExpressAdapter();

  const app = await NestFactory.create(AppModule, adapter, {
    bufferLogs: true,
    rawBody: true,
    autoFlushLogs: true,
    bodyParser: true,
  });

  adapter.get('/', (req, res) => {
    res.send('Equine Directory Server!');
  });

  AppConfiguration(app, adapter);
  await RunServer(app);
}
bootstrap();
