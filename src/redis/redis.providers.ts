import {Provider} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {RedisOptions} from 'ioredis'
import {RedisService} from './redis.service'

export const REDIS_OPTIONS = 'CACHE_OPTIONS'

export const redisOptionsProvider: Provider = {
  provide: REDIS_OPTIONS,
  inject: [ConfigService],
  useFactory: (
    configService: ConfigService<EnvironmentVariables>
  ): RedisOptions => ({
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
  }),
}

export const redisProvider: Provider = {
  provide: RedisService,
  inject: [REDIS_OPTIONS],
  useFactory: (options: RedisOptions): RedisService =>
    new RedisService(options),
}
