import {ArrayMinSize, IsArray, IsNotEmpty, IsString} from 'class-validator'

export class UpdateOrdersNotifyDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({each: true})
  orderIds: string[]
}
