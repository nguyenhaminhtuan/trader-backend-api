import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {SteamModule} from 'steam'
import {AuthController} from './auth.controller'
import {AuthService} from './auth.service'

@Module({
  imports: [ConfigModule, SteamModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
