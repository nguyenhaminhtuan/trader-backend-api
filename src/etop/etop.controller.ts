import {Controller, DefaultValuePipe, Get, Query} from '@nestjs/common'
import {FilterItemsDto, SortItemsDto} from './dto'
import {EtopItem} from './etop.interfaces'
import {EtopService} from './etop.service'

@Controller()
export class EtopControler {
  constructor(private readonly etopService: EtopService) {}

  @Get('/items')
  getEtopBagItems(
    @Query('filter', new DefaultValuePipe({})) filter: FilterItemsDto,
    @Query('sort', new DefaultValuePipe({})) sort: SortItemsDto
  ): Promise<EtopItem[]> {
    return this.etopService.getListItems(filter, sort)
  }
}
