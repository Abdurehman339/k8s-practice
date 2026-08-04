import { Processor, Process } from '@nestjs/bull';
import { TNotificationPayload } from '../types';
import { DatabaseService } from 'src/database/database.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Job } from 'bull';

@Processor('bull:queue.notification')
export class NotificationProcessor {
  constructor(private readonly _database: DatabaseService) {}

  @Process('notification.create')
  async create(job: Job<TNotificationPayload>) {
    const {
      message,
      sender_id,
      reciever_ids,
      title,
      type,
      chat_id,
      appointment_id,
      review_id,
      info,
      fcm,
    } = job.data;

    try {
      // Base data shared across all notifications
      const singleInsertionData = {
        title,
        message,
        type,
        sender_id, // Prisma expects plain string/UUID if schema uses String ID
        ...(info ? { info } : undefined),
        ...(chat_id ? { chat_id } : undefined),
        ...(appointment_id ? { appointment_id } : undefined),
        ...(review_id ? { review_id } : undefined),
      };

      if (Array.isArray(reciever_ids) && reciever_ids.length > 0) {
        // ✅ createMany for multiple notifications
        const multipleInsertionData = reciever_ids.map(
          (recieverId: string) => ({
            receiver_id: recieverId,
            ...singleInsertionData,
          }),
        );

        await this._database.notification.createMany({
          data: multipleInsertionData,
        });
      } else if (typeof reciever_ids === 'string') {
        // ✅ Single insert
        await this._database.notification.create({
          data: {
            receiver_id: reciever_ids,
            ...singleInsertionData,
          },
        });
      }
    } catch (error) {
      console.log('error saving notifications ==>', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Process('notification.delete')
  async delete(job: Job<TNotificationPayload>) {
    const { type, favourite_id, sender_id, reciever_ids } = job.data;

    try {
      // 🗑️ delete related notification (if exists)
      await this._database.notification.deleteMany({
        where: {
          type,
          sender_id,
          receiver_id: reciever_ids[0],
          ...(favourite_id ? { favourite_id } : undefined),
        },
      });
    } catch (error) {
      console.log('error deleting notifications ==>', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Process('notification.restore')
  async restore(job: Job<TNotificationPayload>) {
    const { type, favourite_id, sender_id, reciever_ids } = job.data;

    try {
      // ♻️ restore related notification (if exists)
      await this._database.notification.updateMany({
        where: {
          type,
          sender_id,
          receiver_id: reciever_ids[0],
          ...(favourite_id ? { favourite_id } : undefined),
          deleted_at: { not: null }, // only soft-deleted ones
        },
        data: {
          deleted_at: null,
        },
      });
    } catch (error) {
      console.log('error restoring notifications ==>', error);
      throw new InternalServerErrorException(error);
    }
  }
}
