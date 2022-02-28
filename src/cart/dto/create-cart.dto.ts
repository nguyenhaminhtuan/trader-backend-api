import {IsEnum, IsNotEmpty, IsNumber} from 'class-validator'
import {Game} from 'etop/etop.enums'

export class CreateCartDto {
  @IsNotEmpty()
  @IsNumber()
  itemId: number

  @IsNotEmpty()
  @IsEnum(Game)
  game: Game
}
