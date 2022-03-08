import {ArrayMinSize, IsArray, IsNotEmpty} from 'class-validator'
import {IsObjectId} from 'shared/decorators'

export class UpdateOrdersNotifyDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsObjectId({each: true})
  orderIds: string[]
}
