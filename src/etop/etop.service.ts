import {CACHE_MANAGER, Inject, Injectable, Logger} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {HttpService} from '@nestjs/axios'
import {Cache} from 'cache-manager'
import {firstValueFrom, map} from 'rxjs'
import {EtopBag, EtopItem, EtopLogin, EtopResponse} from './etop.interfaces'

@Injectable()
export class EtopService {
  private readonly logger = new Logger(EtopService.name)
  private readonly credentialsKey = 'etop_credentials'
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

          config.headers['Set-Cookie'] = cookie || ''
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  private async login(): Promise<void> {
    this.logger.debug('Logging Etop')
    const $source = this.httpService.get<EtopResponse<EtopLogin>>(
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
    const {data, headers} = await firstValueFrom($source)

    if (data.type === 'error' || data.statusCode !== 200) {
      this.logger.error({err: new Error(data.message)}, 'Login Etop failed')
      return
    }

    const credentials = headers['set-cookie']?.find((cookie) =>
      cookie.startsWith('DJSP_USER=')
    )
    this.logger.debug({credentials}, 'Credentails')
    this.cacheManager.set(this.credentialsKey, credentials, {ttl: 24 * 60 * 60})
  }

  async getListItems(page: number, rows: number): Promise<EtopItem[]> {
    const cacheKey = `${this.getListItems.name}_${page}_${rows}`
    const cache = await this.cacheManager.get<EtopItem[]>(cacheKey)

    if (cache) {
      return cache
    }

    const appid = this.configService.get('ETOP_APP_ID')
    const endpoint = `/api/user/bag/${appid}/list.do`
    const $source = this.httpService
      .get<EtopResponse<EtopBag>>(endpoint, {
        params: {
          appid,
          lang: 'en',
          page,
          rows,
        },
      })
      .pipe(map((res) => res.data))
    const response = await firstValueFrom($source)

    if (response.type === 'error' || response.statusCode !== 200) {
      this.logger.error(
        new Error(
          `Get bag error with code ${response.code} and statusCode ${response.statusCode}`
        )
      )
      return []
    }

    await this.cacheManager.set(cacheKey, response.data.list)
    return response.data.list
  }
}