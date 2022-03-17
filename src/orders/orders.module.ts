import {forwardRef, Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {DatabaseModule} from 'database'
import {SettingsModule} from 'settings'
import {EtopModule} from 'etop'
import {GiftsModule} from 'gifts'
import {VietQRModule} from 'vietqr'
import {OrdersController} from './orders.controller'
import {OrdersService} from './orders.service'

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    forwardRef(() => SettingsModule),
    EtopModule,
    GiftsModule,
    VietQRModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
