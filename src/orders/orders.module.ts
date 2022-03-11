import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {DatabaseModule} from 'database'
import {EtopModule} from 'etop'
import {SettingsModule} from 'settings'
import {VietQRModule} from 'vietqr'
import {OrdersController} from './orders.controller'
import {OrdersService} from './orders.service'

@Module({
  imports: [
    DatabaseModule,
    SettingsModule,
    ConfigModule,
    EtopModule,
    VietQRModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
