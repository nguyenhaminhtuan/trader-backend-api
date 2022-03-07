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
import {EtopService} from 'etop'
import {
  Collection,
  Db,
  Filter,
  MongoClient,
  ObjectId,
  ReadPreference,
} from 'mongodb'
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
    @Inject(DB_CLIENT) private readonly dbClient: MongoClient,
    private readonly etopSerice: EtopService,
    private readonly settingsService: SettingsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private schedulerRegistry: SchedulerRegistry
  ) {
    this.collection = db.collection(this.collectionName)
  }

  getOrderDescriptionPrefix() {
    return 'V520'
  }

  getOrderById(_id: string | ObjectId, filter?: Filter<Order>) {
    return this.collection.findOne({...filter, _id: new ObjectId(_id)})
  }

  updateOrderStatus(orderId: string | ObjectId, status: OrderStatus) {
    return this.collection.updateOne(
      {_id: new ObjectId(orderId)},
      {$set: {status}}
    )
  }

  async createOrder({items}: CreateOderDto, user: User): Promise<Order> {
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

      await dbSession.commitTransaction()
    } catch (err) {
      this.logger.error({err})
      await dbSession.abortTransaction()
      await dbSession.endSession()
      throw new InternalServerErrorException()
    } finally {
      await dbSession.endSession()
    }

    await this.etopSerice.setLockedItems(order.items.map((i) => i.id))
    this.createOrderTimeout(order._id)
    return order
  }

  createOrderTimeout(orderId: string | ObjectId) {
    const timeoutKey = `orderId-${orderId.toString()}`
    const callback = async () => {
      const order = await this.getOrderById(orderId)

      if (!order) {
        this.logger.error(`Order with id ${orderId.toString()} not found`)
        return
      }

      if (order.status !== OrderStatus.PENDING) {
        this.logger.warn(
          {order: {_id: order._id, status: order.status}},
          `Order already processed`
        )
        return
      }

      await this.collection.updateOne(
        {_id: order._id},
        {$set: {status: OrderStatus.CANCELED}}
      )
      await this.etopSerice.removeLockedItems(order.items.map((i) => i.id))

      this.schedulerRegistry.deleteTimeout(timeoutKey)
    }

    const timeout = setTimeout(callback, 10 * 60 * 1000) // 10 minutes
    this.schedulerRegistry.addTimeout(timeoutKey, timeout)
  }
}
