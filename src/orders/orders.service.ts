import {HttpService} from '@nestjs/axios'
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {SchedulerRegistry} from '@nestjs/schedule'
import {ConfigService, EnvironmentVariables} from 'config'
import {DB, DB_CLIENT} from 'database'
import {EtopItem, EtopService} from 'etop'
import {Game} from 'etop/etop.enums'
import {
  Collection,
  Db,
  Filter,
  MongoClient,
  ObjectId,
  ReadPreference,
} from 'mongodb'
import {RedisService} from 'redis'
import {firstValueFrom, map} from 'rxjs'
import {SettingsService} from 'settings'
import {User} from 'users'
import {CreateOderDto} from './dto'
import {Order, OrderStatus} from './oder.model'
import {VietQRGenerateResponse} from './vietqr.interface'

@Injectable()
export class OrdersService {
  private readonly collectionName = 'orders'
  private readonly collection: Collection<Order>
  private readonly logger = new Logger(OrdersService.name)

  constructor(
    @Inject(DB) db: Db,
    private readonly redisService: RedisService,
    private readonly settingsService: SettingsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly etopService: EtopService,
    @Inject(DB_CLIENT)
    private readonly dbClient: MongoClient,
    private schedulerRegistry: SchedulerRegistry
  ) {
    this.collection = db.collection(this.collectionName)
  }

  getOrderDescriptionPrefix() {
    return 'V520'
  }

  getOrderById(_id: string, filter?: Filter<Order>) {
    return this.collection.findOne({...filter, _id: new ObjectId(_id)})
  }

  updateOrderStatus(orderId: string | ObjectId, status: OrderStatus) {
    return this.collection.updateOne(
      {_id: new ObjectId(orderId)},
      {$set: {status}}
    )
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
    order.userId = user._id.toString()
    order.items = items
    order.amount = amount
    const descPrefix = this.getOrderDescriptionPrefix()

    const source$ = this.httpService
      .post<VietQRGenerateResponse>('/v2/generate', {
        accountNo: +this.configService.get('BANK_ACCOUNT_NO'),
        accountName: this.configService.get('BANK_ACCOUNT_NAME'),
        acqId: +this.configService.get('VIETQR_ACB_ID'),
        addInfo: `${descPrefix}${orderId}`,
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
    const dbSession = this.dbClient.startSession()
    dbSession.startTransaction({
      readPreference: ReadPreference.primary,
      readConcern: {level: 'snapshot'},
      writeConcern: {w: 'majority'},
    })

    try {
      const result = await this.collection.insertOne(order, {
        session: dbSession,
      })

      if (!result.acknowledged) {
        throw new Error('Insert order failed')
      }

      await this.setCacheLockedItems(dotaItems, Game.DOTA)
      await this.setCacheLockedItems(csgoItems, Game.CSGO)
      await dbSession.commitTransaction()
    } catch (err) {
      this.logger.error({err})
      await dbSession.abortTransaction()
      await dbSession.endSession()
      throw new InternalServerErrorException()
    } finally {
      await dbSession.endSession()
    }

    this.createOrderTimeout(order)
    return order
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

    return cache.map((c) => {
      const item = JSON.parse(c) as EtopItem
      if (item.locked) {
        throw new BadRequestException(`Item ${item.id} is locked`)
      }

      return item
    })
  }

  private async setCacheLockedItems(items: EtopItem[], game: Game) {
    if (items.length <= 0) {
      return
    }

    const cacheKey = this.etopService.getCacheKey(game)
    const itemIds = items.map((i) => i.id)
    const cache = await this.redisService.hvals(cacheKey)
    const serializeItems = cache.map((c) => JSON.parse(c)) as EtopItem[]
    const withLockedItems = serializeItems.map((i) => {
      if (itemIds.indexOf(i.id) >= 0) {
        i.locked = true
      }
      return i
    })
    await this.etopService.setCacheItems(withLockedItems, game)
  }

  createOrderTimeout(order: Order) {
    const callback = async () => {
      await this.collection.updateOne(
        {_id: order._id},
        {$set: {status: OrderStatus.CANCELED}}
      )
      const dotaItems = order.items.filter(
        (i) => i.appid.toString() === Game.DOTA
      )
      const csgoItems = order.items.filter(
        (i) => i.appid.toString() === Game.CSGO
      )
      if (dotaItems.length > 0) {
        await this.etopService.setCacheItems(dotaItems, Game.DOTA)
      }
      if (csgoItems.length > 0) {
        await this.etopService.setCacheItems(csgoItems, Game.CSGO)
      }
    }

    const timeout = setTimeout(callback, 15 * 60 * 1000)
    this.schedulerRegistry.addTimeout(
      `orderId-${order._id.toString()}`,
      timeout
    )
  }
}
