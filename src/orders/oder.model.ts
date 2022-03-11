import {customAlphabet as nanoidAlphabet} from 'nanoid'
import {EtopItem} from 'etop'

const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = nanoidAlphabet(alphabet, 10)

export class Order {
  _id = nanoid()
  userId: string
  amount: number
  status: OrderStatus = OrderStatus.PENDING
  items: EtopItem[]
  qr?: {
    qrDataURL: string
    qrCode?: unknown
  }
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
