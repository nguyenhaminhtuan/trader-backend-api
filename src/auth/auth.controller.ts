import {Controller, Delete, Get, Req, Res} from '@nestjs/common'
import {Request, Response} from 'express'
import {promisify} from 'util'
import {AuthService} from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return res.redirect('/')
  }

  @Delete('/logout')
  async logOut(@Req() req: Request, @Res() res: Response) {
    if (!req.session.user) {
      return res.redirect('/')
    }

    const destroySession = promisify(req.session.destroy)
    await destroySession()
    return res.redirect('/')
  }
}
