import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {DatabaseModule} from 'database'
import {EtopModule} from 'etop'
import {OrdersModule} from 'orders'
import {UsersModule} from 'users'
import {CassoController} from './casso.controller'
import {CassoService} from './casso.service'

@Module({
  imports: [
    ConfigModule,
    OrdersModule,
    DatabaseModule,
    EtopModule,
    UsersModule,
  ],
  controllers: [CassoController],
  providers: [CassoService],
  exports: [CassoService],
})
export class CassoModule {}
