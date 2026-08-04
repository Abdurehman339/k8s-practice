import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisService } from '../global-cache/redis/redis.service';
// import { OAuthController } from './controller/oauth';
import { BullModule } from '@nestjs/bull';
import { AuthProcessor } from './processor';
import { AuthQueueService } from './queue';
import { SendgridEmail } from 'utils/service/sendgrid';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'auth',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RedisService,
    AuthProcessor,
    AuthQueueService,
    SendgridEmail,
  ],
  exports: [],
})
export class AuthModule {}
