import {IsEnum, IsNotEmpty} from 'class-validator'
import {Game} from '../etop.enums'

export class FilterItemsDto {
  @IsNotEmpty()
  @IsEnum(Game)
  game: Game
}
