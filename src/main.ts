import {
  ClassSerializerInterceptor,
  ValidationPipe,
  Logger as NestLogger,
} from '@nestjs/common'
import {NestFactory, Reflector} from '@nestjs/core'
import {AppModule} from './app.module'
import {ConfigService, EnvironmentVariables} from 'config'
import {Logger, loggerMiddleware} from 'logger'
import {SESSION_CONFIG} from 'session'
import {gracefulMiddleware, GracefulService} from 'graceful'
import helmet from 'helmet'
import session from 'express-session'

async function bootstrap() {
  const logger = new NestLogger(bootstrap.name)
  const app = await NestFactory.create(AppModule, {bufferLogs: true})

  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService)
  const host = configService.get('HOST')
  const port = configService.get('PORT')

  app.useLogger(app.get(Logger))
  app.setGlobalPrefix('api')
  app.enableCors({origin: [], credentials: true})
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  app.use(loggerMiddleware)
  app.use(helmet())
  app.use(session(app.get(SESSION_CONFIG)))
  app.use(gracefulMiddleware)
  app.get(GracefulService).use(app, {delay: 3000})

  await app.listen(port, host)
  logger.log(`Application is running on ${await app.getUrl()}`)
}
bootstrap()
