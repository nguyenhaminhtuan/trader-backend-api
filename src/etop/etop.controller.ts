import {Controller, Get, Query} from '@nestjs/common'
import {EtopService} from './etop.service'

@Controller('etop')
export class EtopControler {
  constructor(private readonly etopService: EtopService) {}

  @Get('/items')
  getEtopBagItems(@Query('page') page = 1, @Query('rows') rows = 200) {
    return this.etopService.getListItems(page, rows)
  }
}
