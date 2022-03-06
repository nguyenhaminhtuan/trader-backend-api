import {Injectable, InternalServerErrorException, Logger} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {HttpService} from '@nestjs/axios'
import {RedisService} from 'redis'
import {firstValueFrom, map} from 'rxjs'
import {
  EtopBag,
  EtopItem,
  EtopLogin,
  EtopResponse,
  GetEtopGifts,
  UnlockGift,
} from './etop.interfaces'
import {FilterItemsDto, SortItemsDto} from './dto'
import {Sort} from 'shared/enums'
import {Game} from './etop.enums'
import FD from 'form-data'

@Injectable()
export class EtopService {
  private readonly logger = new Logger(EtopService.name)
  private readonly credentialsKey = 'etop_credentials'
  private readonly loginEndpoint = '/mobile/tologin.do'

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService
  ) {
    this.httpService.axiosRef.interceptors.request.use(
      async (config) => {
        if (config.url !== this.loginEndpoint && config.headers) {
          let cookie = await this.redisService.get(this.credentialsKey)

          if (!cookie) {
            await this.login()
            cookie = await this.redisService.get(this.credentialsKey)
          }

          config.headers['Cookie'] = cookie || ''
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  private async login(): Promise<void> {
    this.logger.debug('Start login etopfun')
    const source$ = this.httpService.get<EtopResponse<EtopLogin>>(
      this.loginEndpoint,
      {
        params: {
          email: this.configService.get('ETOP_EMAIL'),
          password: this.configService.get('ETOP_PASSWORD'),
          did: '',
          hot_version: this.configService.get('ETOP_HOT_VERSION'),
        },
      }
    )
    const {data, headers} = await firstValueFrom(source$)

    if (data.type === 'error' || data.statusCode !== 200) {
      this.logger.error({err: new Error(data.message)}, 'Login etopfun failed')
      return
    }

    const credentials = headers['set-cookie'].join('; ')
    this.logger.debug({credentials}, 'Credentails')
    await this.redisService.set(
      this.credentialsKey,
      credentials,
      'ex',
      8 * 60 * 60
    )
  }

  async getListItems(
    filter: FilterItemsDto,
    sort: SortItemsDto
  ): Promise<EtopItem[]> {
    const key = this.getCacheKey(filter.game)
    const cache = await this.redisService.hvals(key)
    let items: EtopItem[] = []

    if (cache.length > 0) {
      items = cache.map((c) => JSON.parse(c))
    } else {
      const endpoint = `/api/user/bag/${filter.game}/list.do`
      const source$ = this.httpService
        .get<EtopResponse<EtopBag>>(endpoint, {
          params: {
            page: 1,
            rows: 1000,
          },
        })
        .pipe(map((res) => res.data))
      const response = await firstValueFrom(source$)

      if (response.type === 'error' || response.statusCode !== 200) {
        throw new InternalServerErrorException()
      }

      items = response.datas.list.map((i) => {
        if (!i.hasOwnProperty('locked')) {
          i.locked = false
        }
        return i
      })
      const cacheResult = await this.setCacheItems(items, filter.game)

      if (cacheResult <= 0) {
        this.logger.error('Set cache items failed')
        throw new InternalServerErrorException()
      }
    }

    if (sort.value) {
      items = items.sort((a, b) =>
        sort.value === Sort.ASC ? a.value - b.value : b.value - a.value
      )
    }

    return items.filter((i) => !i.locked)
  }

  getCacheKey(game: Game) {
    return `game:${game}`
  }

  getCacheField(item: EtopItem) {
    return `item:${item.id}`
  }

  removeCacheItems(items: EtopItem[], game: Game) {
    const multi = this.redisService.multi()
    for (const item of items) {
      multi.hdel(this.getCacheKey(game), this.getCacheField(item))
    }
    return multi.exec()
  }

  async setCacheItems(items: EtopItem[], game: Game) {
    if (items.length <= 0) {
      return 0
    }
    const key = this.getCacheKey(game)
    const itemsByKey = Object.fromEntries(
      items.map((i) => [this.getCacheField(i), JSON.stringify(i)])
    )
    return this.redisService.hset(key, ...Object.entries(itemsByKey))
  }

  giftItemsByGame(items: EtopItem[], game: Game, steamId: string) {
    const source$ = this.httpService
      .get<EtopResponse>(`/gift/${game}/give.do`, {
        params: {
          qruuid: this.getRandomString(),
          fsId: steamId,
          ids: items.map((i) => i.id).join(','),
          did: 355602073326716,
        },
      })
      .pipe(map((res) => res.data))
    return firstValueFrom(source$)
  }

  getEtopGifts() {
    const source$ = this.httpService
      .get<EtopResponse<GetEtopGifts>>('/api/user/gifts.do', {
        params: {
          category: 'give',
        },
      })
      .pipe(map((res) => res.data))
    return firstValueFrom(source$)
  }

  unLockEtopGift(giftId: string) {
    const formData = new FD()
    formData.append('id', giftId)
    const source$ = this.httpService
      .post<EtopResponse<UnlockGift>>('/gift/unlock.do', formData, {
        headers: formData.getHeaders(),
      })
      .pipe(map((res) => res.data))
    return firstValueFrom(source$)
  }

  private getRandomString() {
    const e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefhijklmnopqrstuvwxyz0123456789'
    const t = e.length
    const o = Math.floor(89 * Math.random() + 10)
    const n = Math.floor(89 * Math.random() + 10)
    let i: string | number = o + n
    i < 100 && (i = '0' + i)
    let a = ''
    let r = ''
    for (let s = 0; s < 13; s++) {
      ;(a += e.charAt(Math.floor(Math.random() * t))),
        (r += e.charAt(Math.floor(Math.random() * t)))
    }
    return o + a + i + r + n
  }
}
