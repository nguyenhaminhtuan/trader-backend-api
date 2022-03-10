import {customAlphabet as nanoidAlphabet} from 'nanoid'
import {EtopItem} from 'etop'
import {QRData} from './vietqr.interface'

const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = nanoidAlphabet(alphabet, 10)

export class Order {
  _id = nanoid()
  userId: string
  amount: number
  status: OrderStatus = OrderStatus.PENDING
  items: EtopItem[]
  qr?: QRData
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
