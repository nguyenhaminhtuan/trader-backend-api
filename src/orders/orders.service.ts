import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {SchedulerRegistry} from '@nestjs/schedule'
import {Collection, Db, Filter, MongoClient, ReadPreference} from 'mongodb'
import {ConfigService, EnvironmentVariables} from 'config'
import {DB, DB_CLIENT} from 'database'
import {EtopService} from 'etop'
import {SettingsService} from 'settings'
import {User} from 'users'
import {VietQRService} from 'vietqr'
import {PageDto, PaginateDto} from 'shared/dto'
import {CreateOderDto, OrderDto} from './dto'
import {Order, OrderStatus} from './oder.model'

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
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly vietQRService: VietQRService,
    private schedulerRegistry: SchedulerRegistry
  ) {
    this.collection = db.collection(this.collectionName)
  }

  getOrderDescriptionPrefix() {
    return 'V520'
  }

  getOrderById(_id: string, filter?: Filter<Order>) {
    return this.collection.findOne({...filter, _id})
  }

  async getPaginateOrdersByUser(
    page: PageDto,
    userId: string
  ): Promise<PaginateDto<OrderDto[]>> {
    const count = await this.collection.countDocuments({userId})
    const orders = await this.collection
      .find({userId})
      .limit(page.limit)
      .skip(page.skip)
      .sort('createdAt', -1)
      .toArray()
    return new PaginateDto(
      OrderDto.fromOrders(orders),
      count,
      page.current,
      page.size
    )
  }

  updateOrderStatus(_id: string, status: OrderStatus) {
    return this.collection.updateOne(
      {_id},
      {$set: {status, notify: true, updatedAt: new Date()}}
    )
  }

  getOrderNotifyCount(user: User) {
    return this.collection.countDocuments({
      userId: user._id.toString(),
      notify: true,
    })
  }

  async updateOrdersNotify(orderIds: string[], user: User) {
    const result = await this.collection.updateMany(
      {
        _id: {$in: orderIds},
        userId: user._id.toString(),
        notify: true,
      },
      {$set: {notify: false}}
    )
    return result.acknowledged
  }

  async createOrder({items}: CreateOderDto, user: User): Promise<Order> {
    const lockedIds = (await this.etopSerice.getLockedItemIds()) ?? []

    if (lockedIds.length > 0) {
      items.forEach((item) => {
        if (lockedIds.indexOf(item.id) >= 0) {
          throw new ConflictException('Some items in process')
        }
      })
    }

    const totalValue = items.reduce((total, item) => (total += item.value), 0)
    const setting = await this.settingsService.getSetting()
    const min = 10000
    const amount = Math.round(totalValue * setting.rate)

    if (amount < min) {
      throw new BadRequestException(`Amount must be greater than ${min}`)
    }

    const order = new Order()
    order.userId = user._id.toString()
    order.items = items
    order.amount = amount
    const descPrefix = this.getOrderDescriptionPrefix()

    const dbSession = this.dbClient.startSession()
    dbSession.startTransaction({
      readPreference: ReadPreference.primary,
      readConcern: {level: 'snapshot'},
      writeConcern: {w: 'majority'},
    })

    try {
      const qrResponse = await this.vietQRService.generateQRCode({
        accountNo: +this.configService.get('BANK_ACCOUNT_NO'),
        accountName: this.configService.get('BANK_ACCOUNT_NAME'),
        acqId: +this.configService.get('VIETQR_ACB_ID'),
        addInfo: `${descPrefix}${order._id}`,
        amount,
        template: 'compact2',
      })

      if (qrResponse.code !== '00') {
        throw new Error(
          `Generate QR failed with code: ${qrResponse.code} and description: ${qrResponse.desc}`
        )
      }

      order.qr = qrResponse.data

      const result = await this.collection.insertOne(order, {
        session: dbSession,
      })

      if (!result.acknowledged) {
        throw new Error('Insert order failed')
      }

      await this.etopSerice.setLockedItems(order.items.map((i) => i.id))
      this.createOrderTimeout(order._id)

      await dbSession.commitTransaction()
    } catch (err) {
      this.logger.error({err})
      await dbSession.abortTransaction()
      await dbSession.endSession()
      throw new InternalServerErrorException()
    } finally {
      await dbSession.endSession()
    }

    return order
  }

  createOrderTimeout(orderId: string) {
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

      await this.updateOrderStatus(order._id, OrderStatus.CANCELED)
      await this.etopSerice.removeLockedItems(order.items.map((i) => i.id))

      this.schedulerRegistry.deleteTimeout(timeoutKey)
    }

    const timeout = setTimeout(callback, 10 * 60 * 1000) // 10 minutes
    this.schedulerRegistry.addTimeout(timeoutKey, timeout)
  }
}
