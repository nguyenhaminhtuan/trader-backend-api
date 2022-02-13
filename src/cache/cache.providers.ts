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
    try {
      const redisService = new RedisService({
        host: configService.get('REDIS_HOST'),
        port: +configService.get('REDIS_PORT'),
      })
      await redisService.info()
      logger.log('Redis successfully connected')

      return redisService
    } catch (error) {
      logger.error(error)
    }
  },
}
