import {Inject, Injectable, Logger} from '@nestjs/common'
import {DB_CLIENT} from 'database'
import {EtopItem, EtopService} from 'etop'
import {Game} from 'etop/etop.enums'
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
      this.logger.error({err: error})
      return
    }

    const prefix = this.ordersService.getOrderDescriptionPrefix()
    for (const d of data) {
      if (!d.description.startsWith(prefix)) {
        this.logger.error(
          {payload: d},
          `Invalid prefix in description ${d.description}`
        )
        return
      }
      const orderId = d.description.split(' ')[0].replace(prefix, '')
      const order = await this.ordersService.getOrderById(orderId)

      if (!order) {
        this.logger.error({payload: d}, `Cannot find order with id ${orderId}`)
        return
      }

      const user = await this.usersService.getUserById(order.userId)

      const isNotMatchAmount = d.amount < order.amount
      const isOrderProccessed = order.status !== OrderStatus.PENDING
      const isUserNotFound = !user

      if (isNotMatchAmount || isOrderProccessed || isUserNotFound) {
        if (isNotMatchAmount) {
          this.logger.error({payload: d}, 'Amount not match')
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
        const dotaItems = await this.giftItemsByGame(
          order.items,
          Game.DOTA,
          user.steamId
        )
        const csgoItems = await this.giftItemsByGame(
          order.items,
          Game.CSGO,
          user.steamId
        )
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

        await this.etopService.removeCacheItems(dotaItems, Game.DOTA)
        await this.etopService.removeCacheItems(csgoItems, Game.CSGO)

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

  private async giftItemsByGame(
    gameItems: EtopItem[],
    game: Game,
    steamId: string
  ): Promise<EtopItem[]> {
    const items = gameItems.filter((i) => i.appid.toString() === game)

    if (items.length <= 0) {
      return []
    }

    const giftRes = await this.etopService.giftItemsByGame(items, game, steamId)

    if (giftRes.type !== 'success') {
      throw new Error(giftRes.message)
    }

    return items
  }

  private async updateOrderFailureStatus(orderId: string | ObjectId) {
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
