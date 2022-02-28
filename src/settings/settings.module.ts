import {Module} from '@nestjs/common'
import {DatabaseModule} from 'database'
import {SettingsController} from './settings.controller'
import {SettingsService} from './settings.service'

@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
