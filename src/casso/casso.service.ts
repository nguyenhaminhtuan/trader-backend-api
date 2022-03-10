import {Inject, Injectable, Logger} from '@nestjs/common'
import {DB_CLIENT} from 'database'
import {EtopItem, EtopService, Game} from 'etop'
import {MongoClient, ObjectId, ReadPreference} from 'mongodb'
import {OrdersService, OrderStatus} from 'orders'
import {UsersService} from 'users'
import {CassoWebHookDto} from './dto'

@Injectable()
export class CassoService {
  private readonly logger = new Logger(CassoService.name)

  constructor(
    private readonly ordersService: OrdersService,
    @Inject(DB_CLIENT)
    private readonly dbClient: MongoClient,
    private readonly etopService: EtopService,
    private readonly usersService: UsersService
  ) {}

  async handleWebHook({error, data}: CassoWebHookDto) {
    if (error != 0) {
      this.logger.error({err: error, data})
      return
    }

    const prefix = this.ordersService.getOrderDescriptionPrefix()
    for (const transaction of data) {
      this.logger.log({transaction}, `Processing transaction`)

      if (!transaction.description.startsWith(prefix)) {
        this.logger.error(
          {transaction},
          `Invalid prefix in description ${transaction.description}`
        )
        return
      }
      const orderId = transaction.description.split(' ')[0].replace(prefix, '')
      const order = await this.ordersService.getOrderById(orderId)
      this.logger.log(`Processing order with id ${orderId}`)

      if (!order) {
        this.logger.error({transaction}, `Cannot find order with id ${orderId}`)
        return
      }

      const user = await this.usersService.getUserById(order.userId)

      const isNotMatchAmount = transaction.amount < order.amount
      const isOrderProccessed = order.status !== OrderStatus.PENDING
      const isUserNotFound = !user

      if (isNotMatchAmount || isOrderProccessed || isUserNotFound) {
        if (isNotMatchAmount) {
          this.logger.error({transaction}, 'Amount not match')
        }

        if (isOrderProccessed) {
          this.logger.error(
            {order: {_id: order._id, status: order.status}},
            `Order already proccessed`
          )
        }

        if (isUserNotFound) {
          this.logger.error(
            {order: {_id: order._id}},
            `Cannot find user with userId ${order.userId}`
          )
        }

        await this.updateOrderFailureStatus(order._id)
        return
      }

      const dbSession = this.dbClient.startSession()
      dbSession.startTransaction({
        readPreference: ReadPreference.primary,
        readConcern: {level: 'snapshot'},
        writeConcern: {w: 'majority'},
      })

      try {
        await this.filterAndGift(order.items, Game.DOTA, user.steamId)
        await this.filterAndGift(order.items, Game.CSGO, user.steamId)
        const gifts = await this.etopService.getEtopGifts()

        if (gifts.type !== 'success') {
          throw new Error(gifts.message)
        }

        for (const gift of gifts.datas.list) {
          if (gift.state === 2) {
            this.logger.debug({gift}, 'Unlocking gift')
            const unlock = await this.etopService.unLockEtopGift(gift.id)
            this.logger.debug({unlock}, 'Unlock response')

            if (unlock.type !== 'success') {
              throw new Error(unlock.message || unlock.errors)
            }

            const updatedOrder = await this.ordersService.updateOrderStatus(
              order._id,
              OrderStatus.SUCCESS
            )

            if (!updatedOrder.acknowledged) {
              throw new Error(`Update order ${OrderStatus.SUCCESS} failed`)
            }
          }
        }

        this.logger.log({transaction, order}, 'Payment order successfully')
        await dbSession.commitTransaction()
      } catch (err) {
        this.logger.error({err, order: {_id: order._id}})
        await dbSession.abortTransaction()
        await this.updateOrderFailureStatus(order._id)
      } finally {
        await dbSession.endSession()
        return
      }
    }

    return
  }

  private async filterAndGift(
    gameItems: EtopItem[],
    game: Game,
    steamId: string
  ): Promise<EtopItem[]> {
    const items = gameItems.filter((i) => i.appid === game)

    if (items.length <= 0) {
      return
    }

    const giftRes = await this.etopService.giftEtopItems(items, game, steamId)

    if (giftRes.type !== 'success') {
      throw new Error(giftRes.message)
    }
  }

  private async updateOrderFailureStatus(orderId: string) {
    const updatedOrder = await this.ordersService.updateOrderStatus(
      orderId,
      OrderStatus.FAILURE
    )
    if (!updatedOrder.acknowledged) {
      this.logger.error(
        {order: {_id: orderId}},
        `Update order ${OrderStatus.FAILURE} status failed`
      )
    }
  }
}
