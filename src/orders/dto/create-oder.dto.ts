import {Type} from 'class-transformer'
import {ArrayMinSize, IsNotEmpty, ValidateNested} from 'class-validator'
import {EtopItem} from 'etop'

export class CreateOderDto {
  @IsNotEmpty()
  @ArrayMinSize(1)
  @Type(() => EtopItem)
  @ValidateNested({each: true})
  items: EtopItem[]
}
