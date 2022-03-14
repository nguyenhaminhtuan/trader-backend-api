import {Type} from 'class-transformer'
import {IsNotEmpty, IsPositive, ValidateNested} from 'class-validator'

class SettingRate {
  @IsNotEmpty()
  @IsPositive()
  dota: number

  @IsNotEmpty()
  @IsPositive()
  csgo: number
}

export class CreateSettingDto {
  @Type(() => SettingRate)
  @IsNotEmpty()
  @ValidateNested()
  rate: SettingRate
}
