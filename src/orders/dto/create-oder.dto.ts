import {IsArray, IsNotEmpty, IsPositive} from 'class-validator'
import {ObjectId} from 'mongodb'
import {IsObjectId} from 'shared/decorators'

export class CreateOderDto {
  @IsNotEmpty()
  @IsArray()
  @IsPositive({each: true})
  itemIds: number[]

  @IsNotEmpty()
  @IsArray()
  @IsObjectId({each: true})
  giftIds: ObjectId[]
}
