import {Type} from 'class-transformer'
import {IsEnum, IsNotEmpty, IsPositive, ValidateNested} from 'class-validator'
import {Game} from 'etop/etop.enums'

export class CreateOderDto {
  @IsNotEmpty()
  @Type(() => Cart)
  @ValidateNested({each: true})
  cart: Cart[]
}

export class Cart {
  @IsNotEmpty()
  @IsPositive()
  id: number

  @IsNotEmpty()
  @IsEnum(Game)
  game: Game
}
