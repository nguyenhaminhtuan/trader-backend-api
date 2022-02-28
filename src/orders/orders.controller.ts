import {Body, Controller, Post} from '@nestjs/common'
import {Auth, CurrentUser} from 'shared/decorators'
import {User} from 'users'
import {CreateOderDto} from './dto'
import {OrdersService} from './orders.service'

@Controller('orders')
@Auth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOderDto,
    @CurrentUser() user: User
  ) {
    return this.ordersService.createOrder(createOrderDto, user)
  }
}
