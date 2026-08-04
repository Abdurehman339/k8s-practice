import {
  CacheInterceptor as NestCacheInterceptor,
  CACHE_MANAGER,
  CACHE_TTL_METADATA,
} from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { TRequest } from 'utils/interfaces/t-request';
import { Observable, tap } from 'rxjs';

@Injectable()
export class CustomCacheInterceptor extends NestCacheInterceptor {
  constructor(
    reflector: Reflector,
    @Inject(CACHE_MANAGER) cacheManager: Cache,
  ) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const req: TRequest = context.switchToHttp().getRequest();
    const user_id = req?.user?.id ?? '';

    const route_cache_key = `${req.method}:${req.url}:${user_id}`;

    return route_cache_key;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ttl =
      this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler()) ??
      30; // default TTL = 30s
    const key = this.trackBy(context);
    if (!key) {
      return next.handle();
    }

    const cached = await this.cacheManager.get(key);
    if (cached) {
      console.log(`Cache hit for key: ${key}`);
      return new Observable((observer) => {
        observer.next(cached);
        observer.complete();
      });
    }

    return next.handle().pipe(
      tap((res) => {
        console.log(`Cache set for key: ${key} with ttl: ${ttl}s`);
        this.cacheManager
          .set(key, res, ttl) // ttl in seconds
          .then(() => console.log(`✅ Key saved in Redis: ${key}`))
          .catch((err: any) =>
            console.error(`❌ Failed to cache key: ${key}`, err),
          );
      }),
    );
  }
}
