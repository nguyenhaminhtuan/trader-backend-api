import {Body, Controller, Get, Post} from '@nestjs/common'
import {Auth, CurrentUser} from 'shared/decorators'
import {User, UserRole} from 'users'
import {CreateSettingDto} from './dto'
import {SettingsService} from './settings.service'

@Controller('setting')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @Auth(UserRole.ADMIN, UserRole.DEVELOPER)
  createNewSetting(
    @Body() createSettingDto: CreateSettingDto,
    @CurrentUser() user: User
  ) {
    return this.settingsService.createSetting(createSettingDto, user)
  }

  @Get()
  getSetting() {
    return this.settingsService.getSetting()
  }
}
