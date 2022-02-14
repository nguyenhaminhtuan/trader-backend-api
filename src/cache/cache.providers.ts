import {Logger, Provider} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {CacheModule} from './cache.module'
import {RedisService} from './redis.service'

export const redisServiceProvider: Provider = {
  provide: RedisService,
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService<EnvironmentVariables>
  ): Promise<RedisService> => {
    const logger = new Logger(CacheModule.name)
    const redisService = new RedisService({
      host: configService.get('REDIS_HOST'),
      port: +configService.get('REDIS_PORT'),
    })
    logger.log('Redis successfully connected')
    redisService.on('error', (err) => {
      logger.error({err})
    })

    return redisService
  },
}
