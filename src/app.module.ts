import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import CronModule from './cron/cron.module';
import { TokenModule } from './modules/token/token.module';
import DatabaseModule from './database/database.module';
import { DatabaseService } from './database/database.service';
import { BullModule } from '@nestjs/bull';
import { GlobalCacheModule } from './modules/global-cache/cache.module';
import { HttpClientService } from 'utils/service/http';
import { HttpLoggerMiddleware } from 'utils/middlewares/http-logger';
import WinstonLoggerService from 'utils/middlewares/winston-logger';
import { SanitizationMiddleware } from 'utils/middlewares/sanitizer';
import { AppConfig } from './config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(60),
          limit: 60,
        },
      ],
      errorMessage: 'Too many requests, try again later',
    }),
    BullModule.forRoot({
      url: AppConfig.redis.url,
    }),
    EventEmitterModule.forRoot(),
    GlobalCacheModule,
    AuthModule,
    TokenModule,
    CronModule,
    DatabaseModule,
    HttpModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    DatabaseService,
    Logger,
    AppService,
    HttpClientService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    WinstonLoggerService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*'); // Apply to all routes
    consumer
      .apply(SanitizationMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT },
        { path: '*', method: RequestMethod.PATCH },
        { path: '*', method: RequestMethod.DELETE },
        { path: '*', method: RequestMethod.GET },
      );
  }
}
