import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { CustomCacheInterceptor } from 'src/modules/global-cache/interceptor';

export default function InjectGlobalCacheInterceptor(app: INestApplication) {
  // const reflector = app.get(Reflector);
  // const cacheManager = app.get(CACHE_MANAGER);
  // app.useGlobalInterceptors(
  //   new CustomCacheInterceptor(reflector, cacheManager),
  // );
}
