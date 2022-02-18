import {Injectable, InternalServerErrorException, Logger} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {HttpService} from '@nestjs/axios'
import {RedisService} from 'redis'
import {firstValueFrom, map} from 'rxjs'
import {EtopBag, EtopItem, EtopLogin, EtopResponse} from './etop.interfaces'
import {GetItemsQueryDto} from './dto'
import {Sort} from 'shared/enums'

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
      24 * 60 * 60
    )
  }

  async getListItems(query?: GetItemsQueryDto): Promise<EtopItem[]> {
    const cacheKey = this.getListItems.name
    const cache = await this.redisService.get(cacheKey)

    if (cache) {
      return JSON.parse(cache)
    }

    const appid = this.configService.get('ETOP_APP_ID')
    const endpoint = `/api/user/bag/${appid}/list.do`
    const source$ = this.httpService
      .get<EtopResponse<EtopBag>>(endpoint, {
        params: {
          appid,
          lang: 'en',
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

    let items = response.datas.list
    await this.redisService.set(cacheKey, JSON.stringify(items))

    if (query.sort) {
      const {value} = query.sort

      if (value) {
        items = items.sort((a, b) =>
          value === Sort.ASC ? a.value - b.value : b.value - a.value
        )
      }
    }

    return items
  }
}
