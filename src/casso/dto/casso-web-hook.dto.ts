import {Type} from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class CassoWebHookDto {
  @IsNotEmpty()
  error: number

  @IsNotEmpty()
  @Type(() => WebhookData)
  @ValidateNested({each: true})
  data: WebhookData[]
}

export class WebhookData {
  @IsNotEmpty()
  @IsNumber()
  id: number

  @IsOptional()
  when: string

  @IsNotEmpty()
  @IsNumber()
  amount: number

  @IsNotEmpty()
  @IsString()
  description: string

  @IsOptional()
  cusum_balance: number

  @IsOptional()
  tid: string

  @IsOptional()
  subAccId: string

  @IsOptional()
  bank_sub_acc_id: string
}
