import {Injectable} from '@nestjs/common'
import {HealthCheckError, HealthIndicator} from '@nestjs/terminus'
import {RedisService} from 'redis'

@Injectable()
export class RedisIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super()
  }

  async isHealthy(key: string) {
    try {
      await this.redisService.info()
      return this.getStatus(key, true)
    } catch (error) {
      throw new HealthCheckError('Redischeck failed', error)
    }
  }
}
