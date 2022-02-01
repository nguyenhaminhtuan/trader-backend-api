import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {RedisModule} from 'redis'
import {sessionConfigProvider, SESSION_CONFIG} from './session.config'

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [sessionConfigProvider],
  exports: [SESSION_CONFIG],
})
export class SessionModule {}
