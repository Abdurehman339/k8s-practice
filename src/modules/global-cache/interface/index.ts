import { TRedisTruncateOptions } from '../types';

export interface IGlobalCacheService {
  flush(): Promise<void>;
  flush_sync(): Promise<void>;
  clear(key?: string): Promise<void>;
  set<T>(key?: string, value?: T, ttl?: number): Promise<void>;
  get<T>(key?: string): Promise<T | null>;
  update<T extends Record<string, any>>(
    key?: string,
    partial?: Partial<T>,
  ): Promise<void>;
  truncate(pattern?: string, options?: TRedisTruncateOptions): Promise<void>;
  exists(key?: string): Promise<boolean>;
}
