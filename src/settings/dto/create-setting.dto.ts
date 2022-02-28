import {IsNotEmpty, IsPositive} from 'class-validator'

export class CreateSettingDto {
  @IsNotEmpty()
  @IsPositive()
  rate: number
}
