import {CassoWebhookData} from '../casso.interface'

export interface CassoWebHookDto {
  error: number
  data: CassoWebhookData[]
}
