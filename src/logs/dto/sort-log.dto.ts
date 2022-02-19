import {IsEnum, IsOptional} from 'class-validator'
import {Sort} from 'shared/enums'

export class SortLogDto {
  @IsOptional()
  @IsEnum(Sort)
  time?: Sort

  @IsOptional()
  @IsEnum(Sort)
  level?: Sort
}
