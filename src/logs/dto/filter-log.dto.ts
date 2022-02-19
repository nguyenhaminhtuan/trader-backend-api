import {IsIn, IsOptional, IsString} from 'class-validator'

export class FilterLogDto {
  @IsOptional()
  @IsIn([10, 20, 30, 40, 50, 60])
  level?: number

  @IsOptional()
  @IsString()
  search?: string
}
