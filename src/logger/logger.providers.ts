import {Provider} from '@nestjs/common'
import {ConfigService, EnvironmentVariables, Environment} from 'config'
import {mongodbTransport, prettyTransport} from './transports'
import {LoggerOptions} from 'pino'

export const LOGGER_OPTIONS = 'LOGGER_OPTIONS'

export const loggerOptionsProvider: Provider = {
  provide: LOGGER_OPTIONS,
  inject: [ConfigService],
  useFactory: (
    configService: ConfigService<EnvironmentVariables>
  ): LoggerOptions => {
    const isProd = configService.get('NODE_ENV') === Environment.Production
    return {
      level: !isProd ? 'debug' : 'info',
      transport: !isProd ? prettyTransport : mongodbTransport(configService),
    }
  },
}
