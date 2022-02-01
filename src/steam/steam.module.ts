import {Module} from '@nestjs/common'
import {HttpModule} from '@nestjs/axios'
import {ConfigModule, ConfigService, EnvironmentVariables} from 'config'
import {SteamService} from './steam.service'

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        baseURL: configService.get('STEAM_API_URL'),
        timeout: 1500,
      }),
    }),
  ],
  providers: [SteamService],
  exports: [SteamService],
})
export class SteamModule {}
