import {Module} from '@nestjs/common'
import {DatabaseModule} from 'database'
import {RedisModule} from 'redis'
import {GracefulService} from './graceful.service'

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [GracefulService],
})
export class GracefulModule {}
