import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {HttpService} from '@nestjs/axios'
import {Cache} from 'cache-manager'
import {firstValueFrom, map} from 'rxjs'
import {ConfigService, EnvironmentVariables} from 'config'
import {Sort} from 'shared/enums'
import {
  EtopBag,
  EtopLogin,
  EtopResponse,
  GetEtopGifts,
  UnlockGift,
} from './etop.interfaces'
import {Game} from './etop.enums'
import {EtopItem} from './etop.model'
import {SortItemsDto} from './dto'
import FD from 'form-data'

@Injectable()
export class EtopService {
  private readonly logger = new Logger(EtopService.name)
  private readonly credentialsKey = 'etop_credentials'
  private readonly lockedItemsKey = 'etop_locked_items'
  private readonly loginEndpoint = '/mobile/tologin.do'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService
  ) {
    this.httpService.axiosRef.interceptors.request.use(
      async (config) => {
        if (config.url !== this.loginEndpoint && config.headers) {
          let cookie = await this.cacheManager.get<string>(this.credentialsKey)

          if (!cookie) {
            await this.login()
            cookie = await this.cacheManager.get<string>(this.credentialsKey)
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
    await this.cacheManager.set(this.credentialsKey, credentials, {
      ttl: 8 * 60 * 60 * 1000, // 8 hours
    })
  }

  async getEtopItems(game: Game, sort: SortItemsDto): Promise<EtopItem[]> {
    const endpoint = `/api/user/bag/${game}/list.do`
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
      this.logger.error({payload: response}, 'Get items failed')
      throw new InternalServerErrorException()
    }

    let items = response.datas.list

    if (sort.value) {
      items = items.sort((a, b) =>
        sort.value === Sort.ASC ? a.value - b.value : b.value - a.value
      )
    }

    const lockItemIds = (await this.getLockedItemIds()) || []
    return items.filter((item) => lockItemIds.indexOf(item.id) < 0)
  }

  getLockedItemIds(): Promise<number[]> {
    return this.cacheManager.get<number[]>(this.lockedItemsKey)
  }

  setLockedItems(ids: number[]): Promise<number[]> {
    return this.cacheManager.set<number[]>(this.lockedItemsKey, ids)
  }

  async removeLockedItems(ids: number[]): Promise<number[]> {
    const lockItems = (await this.getLockedItemIds()) || []
    return this.setLockedItems(
      lockItems.filter((item) => ids.indexOf(item) < 0)
    )
  }

  giftEtopItems(items: EtopItem[], game: Game, steamId: string) {
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

  getEtopGifts(): Promise<EtopResponse<GetEtopGifts>> {
    const source$ = this.httpService
      .get<EtopResponse<GetEtopGifts>>('/api/user/gifts.do', {
        params: {
          category: 'give',
        },
      })
      .pipe(map((res) => res.data))
    return firstValueFrom(source$)
  }

  unLockEtopGift(giftId: string): Promise<EtopResponse<UnlockGift>> {
    const formData = new FD()
    formData.append('id', giftId)
    const source$ = this.httpService
      .post<EtopResponse<UnlockGift>>('/gift/unlock.do', formData, {
        headers: formData.getHeaders(),
      })
      .pipe(map((res) => res.data))
    return firstValueFrom(source$)
  }

  private getRandomString(): string {
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
