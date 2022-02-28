import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import {EtopItem} from 'etop/etop.interfaces'
import {RedisService} from 'redis'
import {User} from 'users'
import {CreateCartDto} from './dto'

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name)

  constructor(private readonly redisService: RedisService) {}

  private getCacheKey(user: User): string {
    return `cart:${user._id.toString()}`
  }

  private getHashesField(itemId: number): string {
    return `item:${itemId}`
  }

  async createCart(
    {itemId, game}: CreateCartDto,
    user: User
  ): Promise<EtopItem> {
    this.logger.debug(
      `Creating cart itemId: ${itemId}, game: ${game}, userId: ${user._id.toString()}`
    )
    const cache = await this.redisService.hget(`game:${game}`, `item:${itemId}`)

    if (!cache) {
      throw new NotFoundException(`Item not found`)
    }

    const key = this.getCacheKey(user)
    const field = this.getHashesField(itemId)

    if (await this.redisService.hexists(key, field)) {
      throw new ConflictException('Cart already exists')
    }

    const item = JSON.parse(cache) as EtopItem
    const result = await this.redisService
      .multi()
      .hset(key, field, cache)
      .expire(key, 24 * 60 * 60)
      .exec()
    this.logger.debug(
      `Save cart with result [hset: ${result[1]}, expire: ${result[3]}]`
    )

    return item
  }

  async getAllCart(user: User): Promise<{count: number; data: EtopItem[]}> {
    const cache = await this.redisService.hvals(this.getCacheKey(user))
    return {
      count: cache.length,
      data: cache.map((c) => JSON.parse(c)),
    }
  }

  async removeAllCart(user: User): Promise<boolean> {
    const result = await this.redisService.del(this.getCacheKey(user))
    return result !== 0
  }

  async removeCartById(itemId: number, user: User): Promise<boolean> {
    const key = this.getCacheKey(user)
    const field = this.getHashesField(itemId)

    if (!(await this.redisService.hexists(key, field))) {
      throw new ConflictException('Cart not found')
    }

    const result = await this.redisService.hdel(key, field)
    return result !== 0
  }
}
