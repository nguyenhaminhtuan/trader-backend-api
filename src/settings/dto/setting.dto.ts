import {ObjectId} from 'mongodb'
import {Setting} from '../setting.model'

export class SettingDto {
  _id: ObjectId
  rate: {
    dota: number
    csgo: number
  }

  static fromSetting(setting: Setting): SettingDto {
    const dto = new SettingDto()
    dto._id = setting._id
    dto.rate = setting.rate
    return dto
  }
}
