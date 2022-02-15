import {Module} from '@nestjs/common'
import {DatabaseModule} from 'database'
import {SteamModule} from 'steam'
import {MeController} from './me.controller'
import {MeService} from './me.service'

@Module({
  imports: [DatabaseModule, SteamModule],
  controllers: [MeController],
  providers: [MeService],
  exports: [MeService],
})
export class MeModule {}
