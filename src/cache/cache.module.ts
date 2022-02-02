import {
  Module,
  CacheModule as NestCacheModule,
  OnApplicationShutdown,
} from '@nestjs/common'
import {ConfigModule} from 'config'
import {redisServiceProvider} from './cache.providers'
import {RedisService} from './redis.service'
import {RedisStoreFactory} from './redis.cache-store'

@Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      imports: [CacheModule],
      inject: [RedisStoreFactory, RedisService],
      useFactory: (redis: RedisStoreFactory, client: RedisService) => ({
        store: redis,
        client,
      }),
    }),
  ],
  providers: [RedisStoreFactory, redisServiceProvider],
  exports: [NestCacheModule, RedisStoreFactory, RedisService],
})
export class CacheModule implements OnApplicationShutdown {
  constructor(private readonly redisService: RedisService) {}

  onApplicationShutdown() {
    this.redisService.disconnect()
  }
}
