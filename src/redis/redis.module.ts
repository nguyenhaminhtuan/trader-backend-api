import {Module, OnApplicationShutdown} from '@nestjs/common'
import {ConfigModule} from 'config'
import {redisServiceProvider} from './redis.providers'
import {RedisService} from './redis.service'
import {RedisStoreFactory} from './redis.cache-store'

@Module({
  imports: [ConfigModule],
  providers: [RedisStoreFactory, redisServiceProvider],
  exports: [RedisStoreFactory, RedisService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly redisService: RedisService) {}

  onApplicationShutdown() {
    this.redisService.disconnect()
  }
}
