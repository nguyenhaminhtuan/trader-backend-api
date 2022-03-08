import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import {Auth, CurrentUser} from 'shared/decorators'
import {PageDto} from 'shared/dto'
import {ParsePositiveIntPipe} from 'shared/pipes'
import {User} from 'users'
import {CreateOderDto, UpdateOrdersNotifyDto} from './dto'
import {OrdersService} from './orders.service'

@Controller('orders')
@Auth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/')
  createOrder(
    @Body() createOrderDto: CreateOderDto,
    @CurrentUser() user: User
  ) {
    return this.ordersService.createOrder(createOrderDto, user)
  }

  @Get('/')
  getOrdersByUser(
    @Query('page', new DefaultValuePipe(1), ParsePositiveIntPipe)
    page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParsePositiveIntPipe)
    pageSize: number,
    @CurrentUser()
    user: User
  ) {
    return this.ordersService.getPaginateOrdersByUser(
      new PageDto(page, pageSize),
      user._id.toString()
    )
  }

  @Get('/notify')
  getOrderNotifyCount(@CurrentUser() user: User) {
    return this.ordersService.getOrderNotifyCount(user)
  }

  @Put('/notify')
  updateOrdersNotify(
    @Body() {orderIds}: UpdateOrdersNotifyDto,
    @CurrentUser() user: User
  ) {
    return this.ordersService.updateOrdersNotify(orderIds, user)
  }
}
