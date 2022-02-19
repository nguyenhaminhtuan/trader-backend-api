import {BadRequestException, Injectable, Logger} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {SteamService} from 'steam'
import {User, UsersService} from 'users'
import {wrapAsync} from 'shared/utils'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly steamService: SteamService,
    private readonly usersService: UsersService
  ) {}

  authenticateSteam(): Promise<string> {
    this.logger.debug('Authenticating steam')
    return this.steamService.authenticateOpenId()
  }

  async verifyAuthenticateSteam(url: string): Promise<User> {
    this.logger.debug('Verifying steam redirect')
    const {authenticated, claimedIdentifier} =
      await this.steamService.verifyOpenIdReturnUrl(url)

    if (!authenticated || !claimedIdentifier) {
      this.logger.error('Verify steam return url failed')
      throw new BadRequestException()
    }

    this.logger.debug(
      `Verify steam return url successful with claimed identifier ${claimedIdentifier}`
    )
    const steamId = claimedIdentifier.replace(
      `${this.configService.get('STEAM_OPENID_IDENTIFIER')}/id/`,
      ''
    )
    const {result: user} = await wrapAsync(
      this.usersService.findOrCreateUser(steamId)
    )

    return user
  }
}
