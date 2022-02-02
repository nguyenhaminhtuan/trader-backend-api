import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {CacheModule} from 'cache'
import {sessionConfigProvider, SESSION_CONFIG} from './session.config'

@Module({
  imports: [ConfigModule, CacheModule],
  providers: [sessionConfigProvider],
  exports: [SESSION_CONFIG],
})
export class SessionModule {}
