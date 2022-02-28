import {Module} from '@nestjs/common'
import {RedisModule} from 'redis'
import {CartController} from './cart.controller'
import {CartService} from './cart.service'

@Module({
  imports: [RedisModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
