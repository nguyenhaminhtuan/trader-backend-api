import {HttpService} from '@nestjs/axios'
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {DB} from 'database'
import {EtopItem, EtopService} from 'etop'
import {Game} from 'etop/etop.enums'
import {Collection, Db, ObjectId} from 'mongodb'
import {RedisService} from 'redis'
import {firstValueFrom, map} from 'rxjs'
import {SettingsService} from 'settings'
import {User} from 'users'
import {CreateOderDto} from './dto'
import {Order} from './oder.model'
import {VietQRGenerateResponse} from './vietqr.interface'

@Injectable()
export class OrdersService {
  private readonly collectionName = 'orders'
  private readonly collection: Collection
  private readonly logger = new Logger(OrdersService.name)

  constructor(
    @Inject(DB) db: Db,
    private readonly redisService: RedisService,
    private readonly settingsService: SettingsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly etopService: EtopService
  ) {
    this.collection = db.collection(this.collectionName)
  }

  private async getItemsByGame(
    cart: CreateOderDto['cart'],
    game: Game
  ): Promise<EtopItem[]> {
    let cache = await this.redisService.hmget(
      this.etopService.getCacheKey(game),
      cart.map((c) => `item:${c.id.toString()}`)
    )
    cache = cache.filter((c) => c)

    if (cache.length < cart.length) {
      throw new BadRequestException('Current items not contain cart item')
    }

    return cache.map((c) => JSON.parse(c))
  }

  async createOrder({cart}: CreateOderDto, user: User): Promise<Order> {
    if (cart.length <= 0) {
      throw new BadRequestException('Cart is empty')
    }

    const dotaCart = cart.filter((c) => c.game === Game.DOTA)
    const csgoCart = cart.filter((c) => c.game === Game.CSGO)

    let dotaItems: EtopItem[] = []
    let csgoItems: EtopItem[] = []

    if (dotaCart.length > 0) {
      dotaItems = await this.getItemsByGame(dotaCart, Game.DOTA)
    }

    if (csgoCart.length > 0) {
      csgoItems = await this.getItemsByGame(csgoCart, Game.CSGO)
    }

    const items = [...dotaItems, ...csgoItems]
    const totalValue = items.reduce((total, item) => (total += item.value), 0)
    const setting = await this.settingsService.getSetting()
    const min = 10000
    const amount = Math.round(totalValue * setting.rate)

    if (amount < min) {
      throw new BadRequestException(`Amount must be greater than ${min}`)
    }

    const orderId = new ObjectId()
    const order = new Order(orderId)
    order.userId = user._id
    order.items = items
    order.amount = amount

    const source$ = this.httpService
      .post<VietQRGenerateResponse>('/v2/generate', {
        accountNo: +this.configService.get('BANK_ACCOUNT_NO'),
        accountName: this.configService.get('BANK_ACCOUNT_NAME'),
        acqId: +this.configService.get('VIETQR_ACB_ID'),
        addInfo: `V520-${orderId}`,
        amount,
        template: 'compact2',
      })
      .pipe(map((res) => res.data))
    const response = await firstValueFrom(source$)

    if (response.code !== '00') {
      this.logger.error({payload: response}, 'Generate QR failed')
      throw new InternalServerErrorException()
    }

    order.qr = response.data
    const result = await this.collection.insertOne(order)

    if (!result.acknowledged) {
      this.logger.error('Insert order failed')
      throw new InternalServerErrorException()
    }

    return order
  }
}
