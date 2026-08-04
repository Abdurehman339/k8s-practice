import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from 'src/modules/auth/auth.module';
import { FireabaseService } from './services/firebase';
import { NotificationQueueService } from './queue';
import { NotificationProcessor } from './processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bull:queue.notification',
    }),
    AuthModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    FireabaseService,
    NotificationQueueService,
    NotificationProcessor,
  ],
  exports: [NotificationsService, NotificationQueueService],
})
export class NotificationsModule {}
