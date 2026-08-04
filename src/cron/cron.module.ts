import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import CronService from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [],
  providers: [CronService],
  exports: [CronService],
})
export default class CronModule {}
