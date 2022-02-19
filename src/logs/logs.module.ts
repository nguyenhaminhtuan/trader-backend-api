import {Module} from '@nestjs/common'
import {DatabaseModule} from 'database'
import {LogsController} from './logs.controller'
import {LogsService} from './logs.service'

@Module({
  imports: [DatabaseModule],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
