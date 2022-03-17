import {customAlphabet as nanoidAlphabet} from 'nanoid'
import {EtopItem} from 'etop'
import {Gift} from 'gifts'
import {GiftDto} from 'gifts/dto'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const nanoid = nanoidAlphabet(alphabet, 10)

export class Order {
  _id = nanoid()
  userId: string
  amount: number
  status: OrderStatus = OrderStatus.PENDING
  items: EtopItem[]
  gifts: Gift[] | GiftDto[]
  notify = false
  createdAt = new Date()
  updatedAt = new Date()
}

export enum OrderStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILURE = 'failure',
  CANCELED = 'canceled',
}
