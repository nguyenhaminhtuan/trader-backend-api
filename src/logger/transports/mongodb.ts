import {ConfigService} from '@nestjs/config'
import {EnvironmentVariables} from 'config'

export const mongodbTransport = (
  configService: ConfigService<EnvironmentVariables>
) => ({
  target: 'pino-mongodb',
  options: {
    uri: configService.get('DB_URI'),
    collection: 'logs',
  },
})
