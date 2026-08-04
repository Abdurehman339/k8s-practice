import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import Redis, { RedisKey } from 'ioredis';
import {
  TAddFromDatabaseOptions,
  TNumberOrString,
  TRedisKey,
  TRedisTruncateOptions,
} from './types';
import { IGlobalCacheService } from './interface';
import { EUserRole, Prisma, User } from '@prisma/client';
import { RedisService } from './redis/redis.service';
import { AppConfig } from 'src/config';

@Injectable()
export class GlobalCacheService implements IGlobalCacheService {
  constructor(
    private readonly _redis: RedisService,
    private readonly _database: DatabaseService,
  ) {}

  private client(): Redis {
    return this._redis.client();
  }

  async find_user_from_cache_or_db(id: string) {
    const key = AppConfig.GetAuthKey(id);
    let user = await this.get<Partial<User>>(key);

    if (!user) {
      user = await this._database.user.findFirst({
        // where: { id, role: EUserRole.User, deleted_at: null },
        where: { id, deleted_at: null },
        select: { id: true },
      });
    }

    return user;
  }

  /**
   * Add a record to cache by fetching it from the database
   * @param model Prisma.ModelName (e.g. "User", "Post", "Message")
   * @param id Primary key value of the record
   * @param extra Optional params (select/include/ttl/customKey)
   */
  async add_from_database(
    model?: Prisma.ModelName,
    id?: string,
    options?: TAddFromDatabaseOptions,
  ): Promise<any | undefined> {
    if (!model || !id) {
      return 'Model and ID are required';
    }

    const { select, custom_key, include, ttl, extra_data } = options;

    // Dynamically access Prisma client model
    const prisma_model = (this._database as any)[model.toLowerCase()];

    if (!prisma_model) {
      return `Model ${model} does not exist in database`;
    }

    // ⚠️ Prisma does not allow select + include together
    const query: any = { where: { id } };
    if (select) query.select = select;
    else if (include) query.include = include;

    // Fetch from database
    const record = await prisma_model.findUnique(query);

    if (!record) return;

    let payload: any = {
      ...record,
    };

    if (extra_data) {
      payload.extra_data = extra_data;
    }

    const final_payload: string = JSON.stringify(payload);

    // Cache key
    const key = custom_key || `${model}.${id}`;
    const final_key = `Global:${key}`;

    if (typeof ttl === 'number' && ttl > 0) {
      await this.client().set(final_key, final_payload, 'EX', ttl);
    } else {
      await this.client().set(final_key, final_payload);
    }

    return record;
  }

  async get_from_database<T>(
    model?: Prisma.ModelName,
    id?: string,
    extra?: any,
    ttl = 60, // default 1 minute cache
  ): Promise<T | null | string> {
    if (!model || !id) {
      return 'Model and ID are required';
    }

    const key = `Global:${model}.${id}`;

    // 1. Check in Redis
    const cached = await this.client().get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    // 2. Fetch from database
    // @ts-ignore (Prisma types don’t allow direct indexing but this works)
    const data = await this._database[model.toLowerCase()].findUnique({
      where: { id },
    });

    if (!data) return null;

    // 3. Store in Redis
    await this.client().setex(key, ttl, JSON.stringify(data));

    return data as T;
  }

  /**
   * Set a value in Redis
   * @param key Redis key
   * @param value Typed value (will be stringified)
   * @param ttl Expiry time in seconds (optional)
   */
  async set<T>(key?: string, value?: T, ttl?: number): Promise<void> {
    if (!key || !value) return;

    // const data = JSON.stringify({ value, timestamp: Date.now().toString() });
    const data = JSON.stringify(value);
    if (ttl) {
      await this.client().set(key, data, 'EX', ttl);
    } else {
      await this.client().set(key, data);
    }
  }

  /**
   * Get a value from Redis
   */
  async get<T>(key?: string): Promise<T | null> {
    if (!key) return;
    const data = await this.client().get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  /**
   * Flush all keys in Redis (Async)
   */
  async flush(): Promise<void> {
    await this.client().flushall('ASYNC');
  }

  /**
   * Flush all keys in Redis (Sync)
   */
  async flush_sync(): Promise<void> {
    await this.client().flushall('SYNC');
  }

  /**
   * Update (like set but merges existing object)
   */
  async update<T extends Record<string, any>>(
    key?: string,
    partial?: Partial<T>,
  ): Promise<void> {
    if (!key || !partial) return;
    const existing = await this.get<T>(key);
    if (!existing) return;
    const updated = { ...existing, ...partial };
    await this.set<T>(key, updated);
  }

  /**
   * Delete a single key
   */
  async clear(key?: string): Promise<void> {
    if (!key) return;
    await this.client().del(key);
  }

  async clear_multiple(keys?: string[]): Promise<void> {
    if (!keys || !keys.length) return;

    await Promise.all(keys.map((key) => this.client().del(key)));
  }

  /**
   * Check if key exists
   */
  async exists(key?: string): Promise<boolean> {
    if (!key) return false;
    const exists = await this.client().exists(key);
    return exists === 1;
  }

  /**
   * Truncate keys by pattern
   * @param pattern Redis key pattern (e.g., "user:*")
   * @param options { delete?: boolean; placeholder?: string }
   */
  async truncate(
    pattern?: string,
    options?: TRedisTruncateOptions,
  ): Promise<void> {
    if (!pattern) return;
    const {
      cascase = false,
      place_holder = 'undefined',
      count = 100,
    } = options;

    const redis = this.client();
    const stream = redis.scanStream({ match: pattern, count });

    stream.on('data', async (keys: string[]) => {
      if (keys.length) {
        if (cascase) {
          // Hard delete keys
          await redis.del(...keys);
        } else {
          // Overwrite keys with placeholder (default: "null")
          const pipeline = redis.pipeline();
          keys.forEach((key) => pipeline.set(key, place_holder));
          await pipeline.exec();
        }
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }

  /** -------------------
   * Redis List Methods
   * ------------------- */
  async push_to_list<T>(
    key?: string,
    values?: T[],
    dir: 'left' | 'right' = 'right',
  ): Promise<void> {
    if (!key) return;
    const serialized = values.map((v) => JSON.stringify(v));
    if (dir === 'left') {
      await this.client().lpush(key, ...serialized);
    } else {
      await this.client().rpush(key, ...serialized);
    }
  }

  async push_to_list_with_options<T>(
    key: string,
    value: T,
    max?: number, // optional
    ttl?: number,
    return_data: boolean = false,
  ): Promise<void | T[]> {
    if (!key || !value) return;

    const serialized = JSON.stringify(value);

    // Remove the value if it already exists → to avoid duplicates
    await this.client().lrem(key, 0, serialized);

    // Add the new value to the head
    await this.client().lpush(key, serialized);

    // ✅ Apply trimming only if max_limit is provided
    if (max && max > 0) {
      await this.client().ltrim(key, 0, max - 1);
    }

    // Set TTL if provided
    if (ttl) {
      await this.client().expire(key, ttl);
    }

    if (return_data) {
      const data = await this.client().lrange(key, 0, -1);
      return data.map((item) => JSON.parse(item));
    }
  }

  async get_list<T>(key?: string, start = 0, stop = -1): Promise<T[]> {
    if (!key) return;

    const result = await this.client().lrange(key, start, stop);
    return result.map((item) => JSON.parse(item) as T);
  }

  async list_length(key?: string): Promise<number> {
    if (!key) return 0;
    return this.client().llen(key);
  }

  async remove_from_list<T>(key?: string, value?: T, count = 0): Promise<void> {
    if (!key || !value) return;
    await this.client().lrem(key, count, JSON.stringify(value));
  }

  /** -------------------
   * Redis Set Methods
   * ------------------- */
  async add_to_set<T>(
    key?: string,
    values?: T | T[],
    ttl?: number,
  ): Promise<void> {
    if (!key || !values) return;

    const arr = Array.isArray(values) ? values : [values];
    const serialized = arr.map((v) => JSON.stringify(v));
    await this.client().sadd(key, ...serialized);

    // set TTL if provided
    if (ttl) {
      await this.client().expire(key, ttl);
    }
  }

  async get_set_members<T>(key?: string): Promise<T[]> {
    if (!key) return;
    const result = await this.client().smembers(key);
    return result.map((item) => JSON.parse(item) as T);
  }

  async is_set_member<T>(key?: string, value?: T): Promise<boolean> {
    if (!key || !value) return false;
    const exists = await this.client().sismember(key, JSON.stringify(value));
    return exists === 1;
  }

  async remove_from_set<T>(key?: string, values?: T | T[]): Promise<void> {
    if (!key || !values) return;

    const arr = Array.isArray(values) ? values : [values];
    const serialized = arr.map((v) => JSON.stringify(v));
    await this.client().srem(key, ...serialized);
  }

  async remove_from_set_by_id(key?: string, id?: string): Promise<void> {
    if (!key || !id) return;

    // Get all members of the set
    const members = await this.client().smembers(key);

    if (!members || !members.length) return;

    // Find the member that matches the id
    const target = members.find((m) => {
      try {
        const parsed = JSON.parse(m);
        return parsed.id === id;
      } catch {
        return false;
      }
    });

    if (!target) return;

    // Remove that exact serialized string
    await this.client().srem(key, target);
  }

  /** -------------------
   * Redis Sorted Set Methods (for pagination/ranking)
   * ------------------- */
  async add_to_sorted_set<T>(
    key?: string,
    score?: number,
    value?: T,
  ): Promise<void> {
    if (!key || !score || !value) return;
    await this.client().zadd(key, score, JSON.stringify(value));
  }

  async get_sorted_set<T>(
    key?: string,
    start = 0,
    stop = -1,
    order: 'asc' | 'desc' = 'asc',
  ): Promise<T[]> {
    if (!key) return;
    const result =
      order === 'asc'
        ? await this.client().zrange(key, start, stop)
        : await this.client().zrevrange(key, start, stop);

    return result.map((item) => JSON.parse(item) as T);
  }

  async remove_from_sorted_set<T>(key?: string, value?: T): Promise<void> {
    if (!key || !value) return;
    await this.client().zrem(key, JSON.stringify(value));
  }

  /** ---------------- Search Support ---------------- */
  /** Search list items by substring (e.g., search users by name) */
  async search_from_list<T = any>(
    key?: string,
    keyword?: string,
    start = 0,
    end = -1,
  ): Promise<T[]> {
    if (!key || !keyword) return;
    const items = await this.get_list<T>(key, start, end);
    return items.filter((item: any) =>
      typeof item === 'string'
        ? item.includes(keyword)
        : JSON.stringify(item).includes(keyword),
    );
  }

  async get_keys(key?: string) {
    if (!key) return;
    return await this.client().keys(key);
  }

  async hash_set(key?: RedisKey, object?: any, value?: any) {
    if (!key) return;
    const payload = JSON.stringify(value);
    await this.client().hset(key, object, payload);
  }

  async hash_get(key?: RedisKey, field?: any) {
    if (!key) return;
    return await this.client().hget(key, field);
  }

  async hash_get_all(key?: RedisKey): Promise<any> {
    if (!key) return;
    return await this.client().hgetall(key);
  }

  async clear_by_directory(dir?: string) {
    if (!dir) return;
    const keys = await this.client().keys(dir);

    for (const key of keys) {
      await this.client().del(key);
    }
  }

  async update_by_directory(dir?: string, payload?: any, ttl?: number) {
    if (!dir || !payload) return;
    const keys = await this.client().keys(dir);

    for (const key of keys) {
      await this.set(key, payload);
    }
  }

  async list_push(key?: any, array?: string) {
    if (!key) return;
    return await this.client().lpush(key, array);
  }

  async list_range(
    key?: TRedisKey,
    start?: TNumberOrString,
    stop?: TNumberOrString,
  ): Promise<any[]> {
    if (!key) return;
    return await this.client().lrange(key, start, stop);
  }

  multi() {
    return this.client().multi();
  }
}
