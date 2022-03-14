import {BaseModel} from 'shared/models'
import {User} from 'users'

export class Setting extends BaseModel {
  rate: {
    dota: number
    csgo: number
  }
  createdBy: User
}
