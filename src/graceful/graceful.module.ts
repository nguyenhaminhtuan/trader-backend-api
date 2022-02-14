import {Module} from '@nestjs/common'
import {CacheModule} from 'cache'
import {DatabaseModule} from 'database'
import {GracefulService} from './graceful.service'

@Module({
  imports: [DatabaseModule, CacheModule],
  providers: [GracefulService],
})
export class GracefulModule {}
