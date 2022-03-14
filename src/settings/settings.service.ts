import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {DB} from 'database'
import {Collection, Db} from 'mongodb'
import {User} from 'users'
import {CassoService} from 'casso'
import {VietQRService} from 'vietqr'
import {CreateSettingDto, SettingDto} from './dto'
import {Setting} from './setting.model'

@Injectable()
export class SettingsService {
  private readonly collectionName = 'settings'
  private readonly collection: Collection<Setting>
  private readonly logger = new Logger(SettingsService.name)

  constructor(
    @Inject(DB) db: Db,
    private readonly cassoService: CassoService,
    private readonly vietQRService: VietQRService
  ) {
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

  async getSetting(): Promise<SettingDto> {
    const settings = await this.collection
      .find()
      .sort('createdAt', -1)
      .limit(1)
      .toArray()
    return SettingDto.fromSetting(settings[0])
  }

  async getBankAccounts() {
    const userInfo = await this.cassoService.getUserInfo()

    if (userInfo.error !== 0) {
      this.logger.error({payload: userInfo}, 'Get Casso user info failed')
      throw new InternalServerErrorException()
    }

    const banks = await this.vietQRService.getBanks()

    if (banks.code !== '00') {
      this.logger.error({payload: banks}, 'Get VietQR banks failed')
      throw new InternalServerErrorException()
    }

    return userInfo.data.bankAccs.map((acc) => {
      const bank = banks.data.find((b) => +b.bin === acc.bank.bin)
      return {
        bin: +bank.bin,
        name: bank.name,
        shortName: bank.short_name,
        logo: bank.logo,
        accountNo: acc.bankSubAccId,
        accountName: acc.bankAccountName,
      }
    })
  }
}
