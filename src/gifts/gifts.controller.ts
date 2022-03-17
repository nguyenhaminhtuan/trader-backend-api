import {Body, Controller, Get, Param, Post} from '@nestjs/common'
import {UserRole} from 'users'
import {Auth} from 'shared/decorators'
import {GiftsService} from './gifts.service'
import {CreateGiftDto} from './dto'

@Controller('gifts')
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get('/encrypt/:text')
  encrypt(@Param('text') text: string) {
    return this.giftsService.encryptCode(text)
  }

  @Get('/decrypt/:text')
  decrypt(@Param('text') text: string) {
    return this.giftsService.decryptCode(text)
  }

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
