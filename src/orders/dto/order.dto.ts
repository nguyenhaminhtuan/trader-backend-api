import {EtopItem} from 'etop'
import {Gift} from 'gifts'
import {OrderStatus, Order} from '../oder.model'

export class OrderDto {
  _id: string
  amount: number
  status: OrderStatus
  notify: boolean
  items: EtopItem[]
  gifts: Gift[]
  createdAt: Date
  updatedAt: Date

  static fromOrder(order: Order): OrderDto {
    const dto = new OrderDto()
    dto._id = order._id
    dto.amount = order.amount
    dto.status = order.status
    dto.notify = order.notify
    dto.items = order.items
    dto.gifts = order.gifts
    dto.createdAt = order.createdAt
    dto.updatedAt = order.updatedAt
    return dto
  }
}
