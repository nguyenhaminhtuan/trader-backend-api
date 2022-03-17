import {CacheModule, Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {DatabaseModule} from 'database'
import {GiftsController} from './gifts.controller'
import {GiftsService} from './gifts.service'

@Module({
  imports: [DatabaseModule, ConfigModule, CacheModule.register()],
  controllers: [GiftsController],
  providers: [GiftsService],
  exports: [GiftsService],
})
export class GiftsModule {}
