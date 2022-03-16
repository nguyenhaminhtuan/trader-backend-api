import {IsNotEmpty, IsPositive, IsString} from 'class-validator'

export class CreateGiftDto {
  @IsNotEmpty()
  @IsPositive()
  value: number

  @IsNotEmpty()
  @IsPositive()
  price: number

  @IsNotEmpty()
  @IsString()
  code: string
}
