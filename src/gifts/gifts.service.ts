import {
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {DB} from 'database'
import {Cache} from 'cache-manager'
import {Collection, Db, ObjectId} from 'mongodb'
import {createCipheriv, createDecipheriv} from 'crypto'
import {ConfigService, EnvironmentVariables} from 'config'
import {Gift} from './gift.model'
import {CreateGiftDto, GiftDto} from './dto'

@Injectable()
export class GiftsService {
  private readonly logger = new Logger()
  private readonly giftCollection: Collection<Gift>
  private readonly cipherKey: Buffer
  private readonly cipherIV: Buffer
  private readonly lockedGiftsKey = 'locked_gifts'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(DB) db: Db,
    configService: ConfigService<EnvironmentVariables>
  ) {
    this.giftCollection = db.collection('gifts')
    this.cipherKey = Buffer.from(configService.get('CIPHER_KEY'))
    this.cipherIV = Buffer.from(configService.get('CIPHER_IV'))
  }

  encryptCode(code: string): string {
    const cipher = createCipheriv('aes-256-gcm', this.cipherKey, this.cipherIV)
    const encrypted = cipher.update(code, 'utf-8', 'hex') + cipher.final('hex')
    return encrypted
  }

  decryptCode(encrypted: string): string {
    const deCipher = createDecipheriv(
      'aes-256-gcm',
      this.cipherKey,
      this.cipherIV
    )
    const deEncrypted =
      deCipher.update(encrypted, 'hex', 'utf-8') + deCipher.final('utf-8')
    return deEncrypted
  }

  async getAllGifts(): Promise<GiftDto[]> {
    const gifts = await this.giftCollection
      .find({active: false})
      .sort('value', 1)
      .toArray()
    const lockGiftIds = (await this.getLockedGiftIds()) ?? []
    return gifts
      .map((gift) => GiftDto.fromGift(gift))
      .filter((gift) => lockGiftIds.indexOf(gift._id.toString()) < 0)
  }

  async getGiftsById(ids: string[] | ObjectId[]) {
    const gifts = await this.giftCollection
      .find({
        _id: {$in: ids.map((id: string | ObjectId) => new ObjectId(id))},
        active: false,
      })
      .toArray()
    const lockGiftIds = (await this.getLockedGiftIds()) ?? []
    return gifts
      .map((gift) => GiftDto.fromGift(gift))
      .filter((gift) => lockGiftIds.indexOf(gift._id.toString()) < 0)
  }

  async createGift(dto: CreateGiftDto): Promise<Gift> {
    const gift = new Gift()
    gift.value = dto.value
    gift.price = dto.price
    gift.code = this.encryptCode(dto.code)

    if (await this.giftCollection.findOne({code: gift.code})) {
      throw new ConflictException('Code already exists')
    }

    const insertResult = await this.giftCollection.insertOne(gift)

    if (!insertResult.acknowledged) {
      this.logger.error({payload: dto}, 'Insert gift failed')
      throw new InternalServerErrorException()
    }

    return gift
  }

  getLockedGiftIds(): Promise<string[]> {
    return this.cacheManager.get<string[]>(this.lockedGiftsKey)
  }

  async setLockedGifts(ids: string[]): Promise<string[]> {
    const lockGifts = (await this.getLockedGiftIds()) ?? []
    return this.cacheManager.set<string[]>(
      this.lockedGiftsKey,
      [...new Set([...lockGifts, ...ids])],
      {ttl: 10 * 60}
    )
  }

  async removeLockedItems(ids: string[]): Promise<string[]> {
    const lockGifts = (await this.getLockedGiftIds()) ?? []
    return this.setLockedGifts(
      lockGifts.filter((item) => ids.indexOf(item) < 0)
    )
  }
}
