import {Body, Controller, HttpCode, Post, UseGuards} from '@nestjs/common'
import {CassoService} from './casso.service'
import {CassoWebHookDto} from './dto'
import {SecureTokenGuard} from './secure-token.guard'

@Controller('casso')
export class CassoController {
  constructor(private readonly cassoService: CassoService) {}

  @Post('/webhook')
  @UseGuards(SecureTokenGuard)
  @HttpCode(200)
  handleWebHook(@Body() body: CassoWebHookDto) {
    return this.cassoService.handleWebHook(body)
  }
}
