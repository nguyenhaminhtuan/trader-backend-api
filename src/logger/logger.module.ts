import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {Logger} from './logger'
import {loggerOptionsProvider} from './logger.providers'

@Module({
  imports: [ConfigModule],
  providers: [Logger, loggerOptionsProvider],
  exports: [Logger],
})
export class LoggerModule {}
