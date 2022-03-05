import {BaseModel} from 'shared/models'
import {ObjectId} from 'mongodb'
import {EtopItem} from 'etop'
import {QRData} from './vietqr.interface'

export class Order extends BaseModel {
  userId: string
  items: EtopItem[]
  amount: number
  status: OrderStatus = OrderStatus.PENDING
  qr: QRData

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
