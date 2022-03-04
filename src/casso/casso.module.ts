import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {OrdersModule} from 'orders'
import {CassoController} from './casso.controller'
import {CassoService} from './casso.service'

@Module({
  imports: [ConfigModule, OrdersModule],
  controllers: [CassoController],
  providers: [CassoService],
  exports: [CassoService],
})
export class CassoModule {}
