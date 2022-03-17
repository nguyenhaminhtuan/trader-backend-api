import {
  Controller,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common'
import {Game} from './etop.enums'
import {EtopItem} from './etop.model'
import {EtopService} from './etop.service'

@Controller()
export class EtopControler {
  constructor(private readonly etopService: EtopService) {}

  @Get('/items')
  getEtopItems(
    @Query('game', ParseIntPipe, new ParseEnumPipe(Game)) game: Game
  ): Promise<EtopItem[]> {
    return this.etopService.getEtopItems(game)
  }
}
