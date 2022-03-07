import {Controller, Delete, Get, Req, Res, Session} from '@nestjs/common'
import {Request, Response} from 'express'
import {SessionData} from 'express-session'
import {firstValueFrom} from 'rxjs'
import {SteamService} from 'steam'
import {AuthService} from './auth.service'
import {UserDto} from './dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly steamService: SteamService
  ) {}

  @Get('/user')
  async getAuthenticationStatus(@Session() session: SessionData) {
    if (!session.authenticated) {
      return {authenticated: false, user: null}
    }

    const user = session.user
    const players = await firstValueFrom(
      this.steamService.getPlayerSummaries(user.steamId)
    )

    return {authenticated: true, user: UserDto.fromPlayer(user, players[0])}
  }

  @Get('/steam')
  async authenticateSteam(@Req() req: Request, @Res() res: Response) {
    if (req.session.authenticated) {
      return res.redirect('/')
    }

    const url = await this.authService.authenticateSteam()
    return res.redirect(url)
  }

  @Get('/steam/return')
  async verifyAuthenticateSteam(@Req() req: Request, @Res() res: Response) {
    if (req.session.authenticated) {
      return res.redirect('/')
    }

    const user = await this.authService.verifyAuthenticateSteam(req.url)
    req.session.authenticated = true
    req.session.user = user
    req.session.loginAt = new Date()
    req.session.logoutAt = null

    return res.redirect('/')
  }

  @Delete('/logout')
  async logOut(@Req() req: Request, @Res() res: Response) {
    if (!req.session.authenticated) {
      return res.redirect('/')
    }

    req.session.authenticated = false
    req.session.logoutAt = new Date()

    return res.status(200).json({ok: true})
  }
}
