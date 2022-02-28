import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common'
import {Auth, CurrentUser} from 'shared/decorators'
import {ParsePositiveIntPipe} from 'shared/pipes'
import {User} from 'users'
import {CartService} from './cart.service'
import {CreateCartDto} from './dto'

@Controller('cart')
@Auth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getAllCart(@CurrentUser() user: User) {
    return this.cartService.getAllCart(user)
  }

  @Post()
  createCart(@Body() createCartDto: CreateCartDto, @CurrentUser() user: User) {
    return this.cartService.createCart(createCartDto, user)
  }

  @Delete()
  removeAllCart(@CurrentUser() user: User) {
    return this.cartService.removeAllCart(user)
  }

  @Delete(':id')
  removeCart(
    @Param('id', ParsePositiveIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    return this.cartService.removeCartById(id, user)
  }
}
