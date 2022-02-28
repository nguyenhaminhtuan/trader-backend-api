import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {DB} from 'database'
import {Collection, Db} from 'mongodb'
import {User} from 'users'
import {CreateSettingDto} from './dto'
import {Setting} from './setting.model'

@Injectable()
export class SettingsService {
  private readonly collectionName = 'settings'
  private readonly collection: Collection<Setting>
  private readonly logger = new Logger(SettingsService.name)

  constructor(@Inject(DB) db: Db) {
    this.collection = db.collection(this.collectionName)
  }

  async createSetting({rate}: CreateSettingDto, user: User): Promise<Setting> {
    const setting = new Setting()
    setting.rate = rate
    setting.createdBy = user
    const result = await this.collection.insertOne(setting)

    if (!result.acknowledged) {
      this.logger.error('Insert setting failed')
      throw new InternalServerErrorException()
    }

    return setting
  }

  async getSetting(): Promise<Setting> {
    const settings = await this.collection
      .find()
      .sort('createdAt', -1)
      .limit(1)
      .toArray()
    return settings[0]
  }
}
