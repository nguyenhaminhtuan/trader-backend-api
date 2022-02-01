import {ClassSerializerInterceptor, ValidationPipe} from '@nestjs/common'
import {NestFactory, Reflector} from '@nestjs/core'
import {AppModule} from './app.module'
import {ConfigService, Environment, EnvironmentVariables} from 'config'
import {Logger, loggerMiddleware} from 'logger'
import helmet from 'helmet'
import session from 'express-session'
import Redis from 'ioredis'
import createRedisStore from 'connect-redis'

const RedisStore = createRedisStore(session)

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bufferLogs: true})

  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService)
  const port = configService.get('PORT')
  const host = configService.get('HOST')

  app.useLogger(app.get(Logger))
  app.enableShutdownHooks(['SIGINT', 'SIGTERM'])
  app.setGlobalPrefix('api')
  app.enableCors({origin: [], credentials: true})
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  app.use(loggerMiddleware)
  app.use(helmet())
  app.use(
    session({
      store: new RedisStore({
        client: new Redis({
          host: configService.get('REDIS_PORT'),
          port: configService.get('REDIS_HOST'),
        }),
      }),
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
    })
  )

  await app.listen(port, host)
}
bootstrap()
