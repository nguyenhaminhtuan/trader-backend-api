import {Inject, Injectable, Logger} from '@nestjs/common'
import {HttpService} from '@nestjs/axios'
import {MongoClient, ReadPreference} from 'mongodb'
import {DB_CLIENT} from 'database'
import {EtopItem, EtopService, Game} from 'etop'
import {Gift, GiftsService} from 'gifts'
import {ORDERID_LENGTH, OrdersService, OrderStatus} from 'orders'
import {UsersService} from 'users'
import {firstValueFrom, map} from 'rxjs'
import {GiftDto} from 'gifts/dto'
import {CassoWebHookDto} from './dto'
import {CassoResponse, UserInfo} from './casso.interface'

@Injectable()
export class CassoService {
  private readonly logger = new Logger(CassoService.name)

  constructor(
    @Inject(DB_CLIENT)
    private readonly dbClient: MongoClient,
    private readonly ordersService: OrdersService,
    private readonly etopService: EtopService,
    private readonly giftsService: GiftsService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService
  ) {}

  getUserInfo(): Promise<CassoResponse<UserInfo>> {
    const source$ = this.httpService
      .get<CassoResponse<UserInfo>>('/v2/userInfo')
      .pipe(map((res) => res.data))
    return firstValueFrom(source$)
  }

  async handleWebHook(payload: CassoWebHookDto): Promise<void> {
    const {error, data} = payload
    if (error != 0) {
      this.logger.error({err: error, payload})
      return
    }

    const prefix = this.ordersService.getOrderDescriptionPrefix()
    for (const transaction of data) {
      const prefixIndex = transaction.description.indexOf(prefix)

      if (prefixIndex < 0) {
        return
      }

      this.logger.log({transaction}, `Processing transaction`)
      const orderId = transaction.description.slice(
        prefixIndex,
        prefixIndex + ORDERID_LENGTH + prefix.length
      )
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

      if (isOrderProccessed) {
        return
      }

      if (isNotMatchAmount || isUserNotFound) {
        if (isNotMatchAmount) {
          this.logger.error({transaction}, 'Amount not match')
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
        if (order.items.length > 0) {
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
            }
          }
        }

        if (order.gifts.length > 0) {
          const isActiveUpdated = await this.giftsService.updateGiftActiveByIds(
            order.gifts.map((gift: Gift | GiftDto) => gift._id),
            false
          )

          if (!isActiveUpdated) {
            throw new Error('Update gifts active failed')
          }
        }

        const updatedOrder = await this.ordersService.updateOrderStatus(
          order._id,
          OrderStatus.SUCCESS
        )

        if (!updatedOrder.acknowledged) {
          throw new Error(`Update order ${OrderStatus.SUCCESS} failed`)
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
