import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {Request, Response} from 'express'
import {ConfigService, EnvironmentVariables} from 'config'
import {RedisService} from 'redis'
import {TooManyRequestException} from 'shared/exceptions'

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly redisService: RedisService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()
    const res = context.switchToHttp().getResponse<Response>()
    const ttl = +this.configService.get('THROTTLE_TTL')
    const limit = +this.configService.get('THROTTLE_LIMIT')
    const prefixHeader = 'X-RateLimit'
    const ip = req.ip
    const key = `${ip}:${context.getClass().name}-${context.getHandler().name}`
    const value = await this.redisService.get(key)
    let rate = 1

    if (!value) {
      await this.redisService.multi().incr(key).expire(key, ttl).exec()
    } else {
      rate = parseInt(value, 10)
    }

    const remainingTtl = await this.redisService.ttl(key)

    if (rate > limit) {
      res.setHeader('Retry-After', remainingTtl)
      throw new TooManyRequestException('Exeeced requests limit')
    } else {
      await this.redisService.incr(key)
    }

    res.setHeader(`${prefixHeader}-Limit`, limit)
    res.setHeader(`${prefixHeader}-Remaining`, limit - rate)
    res.setHeader(`${prefixHeader}-Reset`, remainingTtl)

    return true
  }
}
