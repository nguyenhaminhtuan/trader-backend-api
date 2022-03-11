import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common'
import {VietQRService} from 'vietqr'
import {CassoService} from './casso.service'
import {CassoWebHookDto} from './dto'
import {SecureTokenGuard} from './secure-token.guard'

@Controller()
export class CassoController {
  private readonly logger = new Logger(CassoController.name)

  constructor(
    private readonly cassoService: CassoService,
    private readonly vietQRService: VietQRService
  ) {}

  @Post('/casso/webhook')
  @UseGuards(SecureTokenGuard)
  @HttpCode(200)
  handleWebHook(@Body() body: CassoWebHookDto) {
    return this.cassoService.handleWebHook(body)
  }

  @Get('/owner/banks')
  async getInfoBanks() {
    const userInfo = await this.cassoService.getUserInfo()

    if (userInfo.error !== 0) {
      this.logger.error({payload: userInfo}, 'Get Casso user info failed')
      throw new InternalServerErrorException()
    }

    const banks = await this.vietQRService.getBanks()

    if (banks.code !== '00') {
      this.logger.error({payload: banks}, 'Get VietQR banks failed')
      throw new InternalServerErrorException()
    }

    return userInfo.data.bankAccs.map((acc) => {
      const bank = banks.data.find((b) => +b.bin === acc.bank.bin)
      return {name: bank.name, shortName: bank.short_name, logo: bank.logo}
    })
  }
}
