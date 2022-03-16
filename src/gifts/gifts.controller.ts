import {Body, Controller, Get, Post} from '@nestjs/common'
import {UserRole} from 'users'
import {Auth} from 'shared/decorators'
import {GiftsService} from './gifts.service'
import {CreateGiftDto} from './dto'

@Controller('gifts')
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get('/')
  getAllGifts() {
    return this.giftsService.getAllGifts()
  }

  @Post('/')
  @Auth(UserRole.ADMIN, UserRole.DEVELOPER)
  createGift(@Body() dto: CreateGiftDto) {
    return this.giftsService.createGift(dto)
  }
}
