import { Injectable, NotFoundException } from '@nestjs/common';
import { TResponse } from 'utils/interfaces/return';
import Utils from 'utils/service';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client';
import { TPaginationQuery } from 'utils/dtos/query.dto';
import { INotificationService } from './interface';

@Injectable()
export class NotificationsService implements INotificationService {
  constructor(
    // private readonly _firebase: FirebaseAdminService,
    private readonly _database: DatabaseService,
  ) {}

  // async sendPushNotification({
  //   fcm,
  //   title,
  //   message,
  //   topic,
  //   additionalInfo,
  // }: PushNotificationType): Promise<any> {
  //   if (fcm !== null && typeof fcm === 'string') {
  //     await this._firebase.push(fcm, {
  //       message,
  //       title,
  //       data: additionalInfo || null,
  //       topic,
  //     });
  //   }
  // }

  async get(user: Partial<User>, query: TPaginationQuery): Promise<TResponse> {
    const { page, take, search, sort_dir = 'desc' } = query;

    const { skip, keyword } = Utils.pagination(page, take, search);

    const notifications = await this._database.notification.findMany({
      where: {
        deleted_at: null,
        receiver_id: user.id,
        title: { contains: keyword, mode: 'insensitive' },
      },
      select: {
        id: true,
        title: true,
        message: true,
        info: true,
        type: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: sort_dir },
      skip,
      take,
    });

    if (!notifications.length) return [];

    return notifications;
  }

  async delete(
    user: Partial<User>,
    notification_id: string,
  ): Promise<TResponse> {
    const result = await this._database.notification.deleteMany({
      where: { id: notification_id, deleted_at: null, receiver_id: user.id },
    });

    if (result.count === 0) {
      throw new NotFoundException('Notification does not exist');
    }

    return 'Notification deleted successfully';
  }

  async delete_all(user: Partial<User>): Promise<TResponse> {
    const result = await this._database.notification.deleteMany({
      where: { deleted_at: null, receiver_id: user.id },
    });

    if (result.count === 0) {
      return 'Nothing to delete';
    }

    return 'Notifications deleted successfully';
  }
}
