import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { subMonths } from 'date-fns';
import { GlobalCacheService } from 'src/modules/global-cache/cache.service';

@Injectable()
export default class CronService {
  constructor(
    private readonly _database: DatabaseService,
    private readonly _cache: GlobalCacheService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'test' })
  test(): void {
    console.log(`[CRON] ==> timestamp: ${new Date().toISOString()}`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cron:notification.delete.old',
  })
  async handle_delete_notifications(): Promise<void> {
    const twoMonthsAgo = subMonths(new Date(), 2);

    // const result = await this._database.notification.deleteMany({
    //   where: {
    //     deleted_at: null,
    //     created_at: {
    //       lt: twoMonthsAgo,
    //     },
    //   },
    // });
    // console.log(`[CRON] ${result.count} notifications deleted`);
  }

  @Cron(CronExpression.EVERY_30_SECONDS, {
    name: 'cron:users.set.offline.status',
  })
  async set_users_offline() {
    // const online_users = await this._database.user.findMany({
    //   where: { deleted_at: null, online_status: EUserOnlineStatus.Online },
    //   select: { id: true },
    // });
    // const online_users =
    //   await this._cache.get_set_members<string>('online_users');
    // for (const user_id of online_users) {
    //   const stillAlive = await this._cache.get(`ping:user.${user_id}`);
    //   if (!stillAlive) {
    //     await this._cache.remove_from_set('online_users', user_id); // cleanup
    //     await this._database.user.update({
    //       where: { id: user_id },
    //       data: {
    //         online_status: EUserOnlineStatus.Offline,
    //         last_active_at: new Date(),
    //       },
    //     });
    //     this._chatGateway.emit_user_status(user_id, EUserOnlineStatus.Offline);
    //   }
    // }
    // for (const user of online_users) {
    //   const key = await this._redis.get(`ping:user.${user.id}`);
    //   if (!key) {
    //     // No ping => mark offline
    //     await this._database.user.update({
    //       where: { id: user.id },
    //       data: {
    //         online_status: EUserOnlineStatus.Offline,
    //         last_active_at: new Date(),
    //       },
    //     });
    //     this._chatGateway.emit_user_status(user.id, EUserOnlineStatus.Offline);
    //   }
    // }
  }
}
