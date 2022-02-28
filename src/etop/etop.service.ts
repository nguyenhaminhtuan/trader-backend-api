import {Injectable, InternalServerErrorException, Logger} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {HttpService} from '@nestjs/axios'
import {RedisService} from 'redis'
import {firstValueFrom, map} from 'rxjs'
import {EtopBag, EtopItem, EtopLogin, EtopResponse} from './etop.interfaces'
import {FilterItemsDto, SortItemsDto} from './dto'
import {Sort} from 'shared/enums'
import {Game} from './etop.enums'

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
    this.logger.debug('Logging etopfun')
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
        this.logger.error(
          new Error(
            `Get user bag error with code ${response.code} and statusCode ${response.statusCode}`
          )
        )
        throw new InternalServerErrorException()
      }

      items = response.datas.list
      const itemsByKey = Object.fromEntries(
        items.map((i) => [`item:${i.id}`, JSON.stringify(i)])
      )
      await this.redisService.hset(key, ...Object.entries(itemsByKey))
    }

    if (sort.value) {
      items = items.sort((a, b) =>
        sort.value === Sort.ASC ? a.value - b.value : b.value - a.value
      )
    }

    return items
  }

  getCacheKey(game: Game) {
    return `game:${game}`
  }
}
