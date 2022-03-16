import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {createCipheriv, createDecipheriv} from 'crypto'
import {Collection, Db} from 'mongodb'
import {DB} from 'database'
import {ConfigService, EnvironmentVariables} from 'config'
import {Gift} from './gift.model'
import {CreateGiftDto, GiftDto} from './dto'

@Injectable()
export class GiftsService {
  private readonly logger = new Logger()
  private readonly giftCollection: Collection<Gift>
  private readonly cipherKey: Buffer
  private readonly cipherIV: Buffer

  constructor(
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
    const gifts = await this.giftCollection.find().sort('value', 1).toArray()
    return gifts.map((gift) => GiftDto.fromGift(gift))
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
}
