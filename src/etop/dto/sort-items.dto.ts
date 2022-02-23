import {IsOptional, IsEnum} from 'class-validator'
import {Sort} from 'shared/enums'

export class SortItemsDto {
  @IsOptional()
  @IsEnum(Sort)
  value?: Sort
}
