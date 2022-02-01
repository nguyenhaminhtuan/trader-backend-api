import {BadRequestException, Injectable, Logger} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {map} from 'rxjs'
import {SteamService} from 'steam'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly steamService: SteamService
  ) {}

  authenticateSteam(): Promise<string> {
    this.logger.debug('Authenticating steam')
    return this.steamService.authenticateOpenId()
  }

  async verifyAuthenticateSteam(url: string) {
    this.logger.debug('Verifying steam redirect')
    const {authenticated, claimedIdentifier} =
      await this.steamService.verifyOpenIdReturnUrl(url)

    if (!authenticated || !claimedIdentifier) {
      throw new BadRequestException()
    }

    const steamId = claimedIdentifier.replace(
      `${this.configService.get('STEAM_OPENID_IDENTIFIER')}/id/`,
      ''
    )
    return this.steamService
      .getPlayerSummaries(steamId)
      .pipe(map((res) => res.players))
  }
}
