import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {redisOptionsProvider, redisProvider} from './redis.providers'
import {RedisService} from './redis.service'
import {RedisStoreFactory} from './redis.cache-store'

@Module({
  imports: [ConfigModule],
  providers: [RedisStoreFactory, redisOptionsProvider, redisProvider],
  exports: [RedisStoreFactory, RedisService],
})
export class RedisModule {}
