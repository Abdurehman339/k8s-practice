import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';

export class CustomWebSocketAdapter extends IoAdapter {
  constructor(private app: INestApplication) {
    super();
  }

  createIOServer(port: number): any {
    return super.createIOServer(port);
  }
}
