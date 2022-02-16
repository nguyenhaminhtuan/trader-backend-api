import {Logger, Module} from '@nestjs/common'
import {ConfigModule, ConfigService, EnvironmentVariables} from 'config'
import {RedisService} from './redis.service'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RedisService,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>
      ): Promise<RedisService> => {
        const logger = new Logger(RedisModule.name)
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
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
