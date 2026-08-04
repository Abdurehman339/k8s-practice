import { RedisKey } from 'ioredis';

export type TRedisTruncateOptions = {
  cascase?: boolean;
  place_holder?: string;
  count?: number;
};

export type TAddFromDatabaseOptions = {
  select?: any;
  include?: any;
  ttl?: number; // time-to-live in seconds
  custom_key?: string; // overwrite default cache key
  extra_data?: any;
};

export type TNumberOrString = number | string | undefined;
export type TRedisKey = RedisKey | string;
