import {Provider} from '@nestjs/common'
import {ConfigService, EnvironmentVariables, Environment} from 'config'
import {LOGGER_OPTIONS} from './logger.constant'
import {prettyTransport} from './logger.transports'
import {LoggerOptions} from 'pino'

export const loggerOptionsProvider: Provider = {
  provide: LOGGER_OPTIONS,
  inject: [ConfigService],
  useFactory: (
    configService: ConfigService<EnvironmentVariables>
  ): LoggerOptions => {
    const isProd = configService.get('NODE_ENV') === Environment.Production
    return {
      level: !isProd ? 'debug' : 'info',
      transport: !isProd && prettyTransport,
    }
  },
}
