import {
  CacheStore,
  CacheStoreFactory,
  CacheStoreSetOptions,
  Injectable,
  LiteralObject,
} from '@nestjs/common'
import {Redis} from 'ioredis'

export class RedisCacheStore implements CacheStore {
  constructor(private readonly client: Redis) {}

  async set(key: string, value: any, options?: CacheStoreSetOptions<any>) {
    options && options.ttl
      ? await this.client.set(key, value, 'ex', options.ttl as number)
      : await this.client.set(key, value)
  }

  async get<T>(key: string) {
    const value = await this.client.get(key)
    return JSON.parse(value) as T
  }

  async del(key: string) {
    await this.client.del(key)
  }

  async reset() {
    await this.client.flushdb()
  }
}

@Injectable()
export class RedisStoreFactory implements CacheStoreFactory {
  create(args: LiteralObject): CacheStore {
    return new RedisCacheStore(args.client)
  }
}
