import {Injectable} from '@nestjs/common'
import session, {SessionOptions} from 'express-session'
import connectRedis from 'connect-redis'
import {Request} from 'express'
import {ConfigService, Environment, EnvironmentVariables} from './'
import {RedisService} from 'redis'
import {v4 as uuidV4} from 'uuid'

const RedisStore = connectRedis(session)

@Injectable()
export class SessionConfig implements SessionOptions {
  secret: string | string[]
  genid: (req: Request) => string
  name?: string
  store?: session.Store
  cookie?: session.CookieOptions
  rolling?: boolean
  resave?: boolean
  proxy?: boolean
  saveUninitialized?: boolean
  unset?: 'destroy' | 'keep'

  constructor(
    configService: ConfigService<EnvironmentVariables>,
    redis: RedisService
  ) {
    this.store = new RedisStore({
      client: redis,
      prefix: configService.get('SESSION_PREFIX'),
    })
    this.secret = configService.get('SESSION_COOKIE_SECRET')
    this.resave = false
    this.saveUninitialized = false
    this.genid = () => uuidV4()
    this.name = 'sid'
    this.cookie = {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: configService.get('NODE_ENV') === Environment.Production,
      maxAge: +configService.get('SESSION_COOKIE_TTL'),
    }
  }
}
