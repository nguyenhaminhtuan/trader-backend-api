import {BaseModel} from 'shared/models'
import {ObjectId} from 'mongodb'
import {EtopItem} from 'etop'
import {QRData} from './vietqr.interface'

export class Order extends BaseModel {
  userId: string
  amount: number
  status: OrderStatus = OrderStatus.PENDING
  items: EtopItem[]
  qr: QRData
  notify = false

  constructor(_id: ObjectId) {
    super(_id)
  }
}

export enum OrderStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILURE = 'failure',
  CANCELED = 'canceled',
}
