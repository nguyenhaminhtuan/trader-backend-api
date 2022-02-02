import {ConfigService} from '@nestjs/config'
import {EnvironmentVariables} from 'config'

export const mongodbTransport = (
  configService: ConfigService<EnvironmentVariables>
) => ({
  target: 'pino-mongodb',
  options: {
    uri: configService.get('DB_URI'),
    database: configService.get('DB_NAME'),
    collection: 'logs',
    mongoOptions: {
      auth: {
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
      },
    },
  },
})
