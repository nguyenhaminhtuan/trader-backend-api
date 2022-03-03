import {Controller, Delete, Get, Req, Res} from '@nestjs/common'
import {Request, Response} from 'express'
import {firstValueFrom} from 'rxjs'
import {SessionsService} from 'sessions'
import {CurrentUser} from 'shared/decorators'
import {SteamService} from 'steam'
import {User} from 'users'
import {AuthService} from './auth.service'
import {UserDto} from './dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly steamService: SteamService,
    private readonly sessionsService: SessionsService
  ) {}

  @Get('/user')
  async getAuthenticationStatus(@CurrentUser() user: User) {
    if (!user) {
      return {authenticated: false, user: null}
    }

    const players = await firstValueFrom(
      this.steamService.getPlayerSummaries(user.steamId)
    )

    return {authenticated: true, user: UserDto.fromPlayer(user, players[0])}
  }

  @Get('/steam')
  async authenticateSteam(@Req() req: Request, @Res() res: Response) {
    if (req.session.user) {
      return res.redirect('/')
    }

    const url = await this.authService.authenticateSteam()
    return res.redirect(url)
  }

  @Get('/steam/return')
  async verifyAuthenticateSteam(@Req() req: Request, @Res() res: Response) {
    if (req.session.user) {
      return res.redirect('/')
    }

    const user = await this.authService.verifyAuthenticateSteam(req.url)
    req.session.user = user
    await this.sessionsService.createSession(user._id, req.session)
    return res.redirect('/')
  }

  @Delete('/logout')
  async logOut(@Req() req: Request, @Res() res: Response) {
    if (!req.session.user) {
      return res.redirect('/')
    }

    await this.sessionsService.logoutSession(req.session.id)
    req.session.user = null
    return res.status(200).json({ok: true})
  }
}
