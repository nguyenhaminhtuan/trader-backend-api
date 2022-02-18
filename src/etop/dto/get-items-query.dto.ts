import {Type} from 'class-transformer'
import {IsEnum, IsObject, IsOptional, ValidateNested} from 'class-validator'
import {Sort} from 'shared/enums'

class SortItems {
  @IsOptional()
  @IsEnum(Sort)
  value?: Sort
}

export class GetItemsQueryDto {
  @Type(() => SortItems)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  sort?: SortItems
}
