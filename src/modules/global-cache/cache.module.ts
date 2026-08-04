import { Global, Module } from '@nestjs/common';
import DatabaseModule from 'src/database/database.module';
import { RedisService } from './redis/redis.service';
import { GlobalCacheService } from './cache.service';

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [RedisService, GlobalCacheService],
  exports: [RedisService, GlobalCacheService],
})
export class GlobalCacheModule {}
