import {Module} from '@nestjs/common'
import {DatabaseModule} from 'database'
import {GracefulService} from './graceful.service'

@Module({
  imports: [DatabaseModule],
  providers: [GracefulService],
})
export class GracefulModule {}
