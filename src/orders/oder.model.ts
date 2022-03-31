import {customAlphabet as nanoidAlphabet} from 'nanoid'
import {EtopItem} from 'etop'
import {Gift} from 'gifts'

export const ORDERID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const ORDERID_LENGTH = 10

const nanoid = nanoidAlphabet(ORDERID_ALPHABET, ORDERID_LENGTH)

export class Order {
  _id = nanoid()
  userId: string
  amount: number
  status: OrderStatus = OrderStatus.PENDING
  items: EtopItem[]
  gifts: Gift[]
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
