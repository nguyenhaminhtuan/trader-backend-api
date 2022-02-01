import {ClassSerializerInterceptor, ValidationPipe} from '@nestjs/common'
import {NestFactory, Reflector} from '@nestjs/core'
import {AppModule} from './app.module'
import {ConfigService, EnvironmentVariables} from 'config'
import {Logger, loggerMiddleware} from 'logger'
import {SESSION_CONFIG} from 'session'
import helmet from 'helmet'
import session from 'express-session'

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
  app.use(session(app.get(SESSION_CONFIG)))

  await app.listen(port, host)
}
bootstrap()
