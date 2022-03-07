import {
  IsString,
  IsEnum,
  IsPositive,
  IsNumber,
  IsNotEmpty,
  IsOptional,
} from 'class-validator'
import {Game} from './etop.enums'

class CommonProp {
  color: string
  name: string
  tag: string
}

export class EtopItem {
  @IsNotEmpty()
  @IsString()
  image: string

  @IsOptional()
  type_name: any

  @IsOptional()
  hero: string

  @IsOptional()
  type: any

  @IsOptional()
  imageBottomShow: CommonProp

  @IsOptional()
  quality: CommonProp

  @IsOptional()
  pop: {
    bottom: CommonProp[]
    topName: CommonProp
  }

  @IsOptional()
  show_type: string

  @IsOptional()
  local_image: string

  @IsOptional()
  hero_localname: any

  @IsEnum(Game)
  appid: Game

  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  is_custom: boolean

  @IsOptional()
  name_color: string

  @IsNotEmpty()
  @IsPositive()
  id: number

  @IsNotEmpty()
  @IsNumber()
  state: number

  @IsOptional()
  shortName: string

  @IsNotEmpty()
  @IsPositive()
  value: number

  @IsOptional()
  rarity: CommonProp

  @IsOptional()
  status: {
    redlock: number
  }
}
