import {Controller, Get, Query} from '@nestjs/common'
import {GetItemsQueryDto} from './dto'
import {EtopItem} from './etop.interfaces'
import {EtopService} from './etop.service'

@Controller()
export class EtopControler {
  constructor(private readonly etopService: EtopService) {}

  @Get('/items')
  getEtopBagItems(@Query() query?: GetItemsQueryDto): Promise<EtopItem[]> {
    return this.etopService.getListItems(query)
  }
}
