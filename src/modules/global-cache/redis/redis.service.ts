import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { AppConfig } from 'src/config';

@Injectable()
export class RedisService {
  private _client: Redis;

  constructor() {
    try {
      this._client = new Redis(AppConfig.redis);
    } catch (error) {
      Logger.error('error connecting redis instance ==>', error);
    }
  }

  client(): Redis {
    return this._client;
  }
}
