import {Injectable, Logger} from '@nestjs/common'
import {OrdersService, OrderStatus} from 'orders'
import {wrapAsync} from 'shared/utils'
import {CassoWebHookDto} from './dto'

@Injectable()
export class CassoService {
  private readonly logger = new Logger(CassoService.name)

  constructor(private readonly ordersService: OrdersService) {}

  async handleWebHook({error, data}: CassoWebHookDto) {
    if (error != 0) {
      this.logger.error({err: error})
      return
    }

    const prefix = this.ordersService.getOrderDescriptionPrefix()
    const orderIds: string[] = []
    for (const d of data) {
      if (!d.description.startsWith(prefix)) {
        this.logger.error(`Invalid prefix in description ${d.description}`)
        return
      }
      const orderId = d.description.replace(prefix, '')
      orderIds.push(orderId)
    }
    const {result, err} = await wrapAsync(
      this.ordersService.updateManyOrderStatus(orderIds, OrderStatus.SUCCESS)
    )

    if (err) {
      this.logger.error({err})
    }

    this.logger.log('Order status updated', {result})
    return
  }
}
