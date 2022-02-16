import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {RedisModule} from 'redis'
import {DatabaseModule} from 'database'
import {SessionsController} from './sessions.controller'
import {SessionsService} from './sessions.service'

@Module({
  imports: [ConfigModule, RedisModule, DatabaseModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
