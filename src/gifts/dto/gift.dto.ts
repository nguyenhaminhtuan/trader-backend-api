import {ObjectId} from 'mongodb'
import {Gift} from '../gift.model'

export class GiftDto {
  _id: ObjectId
  value: number
  price: number

  static fromGift(gift: Gift): GiftDto {
    const dto = new GiftDto()
    dto._id = gift._id
    dto.value = gift.value
    dto.price = gift.price
    return dto
  }
}
