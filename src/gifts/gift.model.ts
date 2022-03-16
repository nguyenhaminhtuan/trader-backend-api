import {BaseModel} from 'shared/models'

export class Gift extends BaseModel {
  value: number
  price: number
  code: string
  active = false
}
