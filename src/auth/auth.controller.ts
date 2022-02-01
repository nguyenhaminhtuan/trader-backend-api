import {Controller, Delete, Get, Req, Res, Session} from '@nestjs/common'
import {Request, Response} from 'express'
import {firstValueFrom} from 'rxjs'
import {promisify} from 'util'
import {AuthService} from './auth.service'
import {UserSession} from 'shared/types/user-session.type'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/steam')
  async authenticateSteam(@Res() res: Response) {
    const url = await this.authService.authenticateSteam()
    return res.redirect(url)
  }

  @Get('/steam/return')
  async verifyAuthenticateSteam(
    @Req() req: Request,
    @Session() session: UserSession,
    @Res() res: Response
  ) {
    const $source = await this.authService.verifyAuthenticateSteam(req.url)
    const players = await firstValueFrom($source)
    session.user = players[0]
    return res.redirect('/')
  }

  @Delete('/logout')
  async logOut(@Req() req: Request, @Res() res: Response) {
    const destroySession = promisify(req.session.destroy)
    await destroySession()
    return res.redirect('/')
  }
}
