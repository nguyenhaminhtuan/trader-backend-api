import {Provider} from '@nestjs/common'
import session, {SessionOptions} from 'express-session'
import connectRedis from 'connect-redis'
import {ConfigService, Environment, EnvironmentVariables} from 'config'
import {RedisService} from 'redis'

const RedisStore = connectRedis(session)

export const SESSION_CONFIG = 'SESSION_CONFIG'

export const sessionConfigProvider: Provider = {
  provide: SESSION_CONFIG,
  inject: [ConfigService, RedisService],
  useFactory: (
    configService: ConfigService<EnvironmentVariables>,
    client: RedisService
  ): SessionOptions => ({
    store: new RedisStore({client}),
    secret: configService.get('SESSION_COOKIE_SECRET'),
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: configService.get('NODE_ENV') === Environment.Production,
      maxAge: configService.get('SESSION_COOKIE_TTL'),
    },
  }),
}
