import {ValidationPipe, Logger as NestLogger} from '@nestjs/common'
import {NestFactory} from '@nestjs/core'
import {NestExpressApplication} from '@nestjs/platform-express'
import {AppModule} from './app.module'
import {
  ConfigService,
  Environment,
  EnvironmentVariables,
  SessionConfig,
} from 'config'
import {Logger, loggerMiddleware} from 'logger'
import {gracefulMiddleware, GracefulService} from 'graceful'
import helmet from 'helmet'
import session from 'express-session'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import {RewriteFrames} from '@sentry/integrations'

async function bootstrap() {
  const logger = new NestLogger(bootstrap.name)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  })

  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService)
  const host = configService.get('HOST')
  const port = configService.get('PORT')

  app.set('trust proxy', true)
  app.useLogger(app.get(Logger))
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: configService.get('ALLOWED_HOSTS').split(','),
    credentials: true,
  })
  app.useGlobalPipes(new ValidationPipe({whitelist: true}))

  if (configService.get('NODE_ENV') === Environment.Production) {
    Sentry.init({
      dsn: configService.get('SENTRY_DSN'),
      integrations: [
        new RewriteFrames({
          root: __dirname || process.cwd(),
        }),
        new Sentry.Integrations.Http({tracing: true}),
        new Tracing.Integrations.Express({app: app as any}),
        new Tracing.Integrations.Mongo(),
      ],
      tracesSampleRate: 1.0,
      environment: configService.get('NODE_ENV'),
    })

    app.use(Sentry.Handlers.requestHandler())
    app.use(Sentry.Handlers.tracingHandler())
  }

  app.use(loggerMiddleware)
  app.use(helmet())
  app.use(session(app.get(SessionConfig)))
  app.use(gracefulMiddleware)
  app.get(GracefulService).use(app, {delay: 3000})

  await app.listen(port, host)
  logger.log(`Application is running on ${await app.getUrl()}`)
}
bootstrap()
