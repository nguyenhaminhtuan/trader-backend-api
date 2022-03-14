import {Module} from '@nestjs/common'
import {DatabaseModule} from 'database'
import {CassoModule} from 'casso'
import {VietQRModule} from 'vietqr'
import {SettingsController} from './settings.controller'
import {SettingsService} from './settings.service'

@Module({
  imports: [DatabaseModule, CassoModule, VietQRModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
