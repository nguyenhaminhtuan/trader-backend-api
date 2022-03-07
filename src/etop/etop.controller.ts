import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common'
import {SortItemsDto} from './dto'
import {Game} from './etop.enums'
import {EtopItem} from './etop.model'
import {EtopService} from './etop.service'

@Controller()
export class EtopControler {
  constructor(private readonly etopService: EtopService) {}

  @Get('/items')
  getEtopItems(
    @Query('game', ParseIntPipe, new ParseEnumPipe(Game)) game: Game,
    @Query('sort', new DefaultValuePipe({})) sort: SortItemsDto
  ): Promise<EtopItem[]> {
    return this.etopService.getEtopItems(game, sort)
  }
}
