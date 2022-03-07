import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Query,
} from '@nestjs/common'
import {Auth, CurrentUser} from 'shared/decorators'
import {PageDto} from 'shared/dto'
import {ParsePositiveIntPipe} from 'shared/pipes'
import {User} from 'users'
import {CreateOderDto} from './dto'
import {OrdersService} from './orders.service'

@Controller('orders')
@Auth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/')
  async createOrder(
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
}
