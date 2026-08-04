import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JobOptions, Queue } from 'bull';

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue('bull:queue.notification') private readonly _queue: Queue,
  ) {}

  async create<T>(data: T, options?: JobOptions) {
    await this._queue.add('notification.create', data, {
      attempts: 2,
      removeOnComplete: true,
      ...options,
    });
  }

  async delete<T>(data: T, options?: JobOptions) {
    await this._queue.add('notification.delete', data, {
      attempts: 2,
      removeOnComplete: true,
      ...options,
    });
  }

  async restore<T>(data: T, options?: JobOptions) {
    await this._queue.add('notification.restore', data, {
      attempts: 2,
      removeOnComplete: true,
      ...options,
    });
  }
}
