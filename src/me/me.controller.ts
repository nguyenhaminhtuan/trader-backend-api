import {Controller, Get} from '@nestjs/common'
import {firstValueFrom} from 'rxjs'
import {Auth, CurrentUser} from 'shared/decorators'
import {SteamService} from 'steam'
import {User} from 'users'
import {MeDto} from './dto'
import {MeService} from './me.service'

@Controller('me')
@Auth()
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly steamService: SteamService
  ) {}

  @Get()
  async getMe(@CurrentUser() user: User): Promise<any> {
    const players = await firstValueFrom(
      this.steamService.getPlayerSummaries(user.steamId)
    )
    return MeDto.fromUserPlayer(user, players[0])
  }
}
