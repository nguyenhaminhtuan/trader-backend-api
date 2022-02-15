import {Controller, Get, Session, UseGuards} from '@nestjs/common'
import {AuthGuard} from 'auth'
import {firstValueFrom} from 'rxjs'
import {UserSession} from 'shared/types'
import {SteamService} from 'steam'
import {MeDto} from './dto'
import {MeService} from './me.service'

@Controller('/me')
@UseGuards(AuthGuard)
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly steamService: SteamService
  ) {}

  @Get()
  async getMe(@Session() session: UserSession): Promise<any> {
    const currentUser = session.user
    const players = await firstValueFrom(
      this.steamService.getPlayerSummaries(currentUser.steamId)
    )
    return MeDto.fromUserPlayer(currentUser, players[0])
  }
}
