import {Injectable, Logger} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {HttpService} from '@nestjs/axios'
import openid from 'openid'
import {map, Observable} from 'rxjs'
import {SteamPlayer} from './steam.interfaces'

@Injectable()
export class SteamService {
  private readonly relyingParty: openid.RelyingParty
  private readonly logger = new Logger(SteamService.name)

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService
  ) {
    this.relyingParty = new openid.RelyingParty(
      this.configService.get('STEAM_OPENID_RETURN_URL'),
      this.configService.get('STEAM_OPENID_REALM'),
      true,
      true,
      []
    )
  }

  authenticateOpenId(): Promise<string> {
    this.logger.debug('Authenticating steam via openid')

    return new Promise((resolve, reject) => {
      this.relyingParty.authenticate(
        this.configService.get('STEAM_OPENID_IDENTIFIER'),
        false,
        (err, authUrl) => {
          if (err) reject(err)
          resolve(authUrl)
        }
      )
    })
  }

  verifyOpenIdReturnUrl(url: string): Promise<{
    authenticated: boolean
    claimedIdentifier?: string
  }> {
    this.logger.debug('Verifying return url from steam')

    return new Promise((resolve, reject) => {
      this.relyingParty.verifyAssertion(url, (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })
  }

  getPlayerSummaries(steamids: string | string[]): Observable<SteamPlayer[]> {
    const endpoint = '/ISteamUser/GetPlayerSummaries'
    const version = 'v0002'
    return this.httpService
      .get<{response: {players: SteamPlayer[]}}>(`${endpoint}/${version}`, {
        params: {
          key: this.configService.get('STEAM_API_KEY'),
          steamids,
        },
      })
      .pipe(map((res) => res.data.response.players))
  }
}
