import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JobOptions, Queue } from 'bull';

@Injectable()
export class AuthQueueService {
  constructor(@InjectQueue('auth') private readonly _queue: Queue) {}

  async email<T>(data: T, options?: JobOptions) {
    await this._queue.add('email:send', data, {
      attempts: 3,
      removeOnComplete: true,
      ...options,
    });
  }
}
