import {Module} from '@nestjs/common'
import {HttpModule} from '@nestjs/axios'
import {ConfigModule, ConfigService, EnvironmentVariables} from 'config'
import {VietQRService} from './vietqr.service'

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        baseURL: configService.get('VIETQR_API_URL'),
        headers: {
          Authorization: `Apikey ${configService.get('CASSO_API_KEY')}`,
        },
        timeout: 3500,
      }),
    }),
  ],
  controllers: [],
  providers: [VietQRService],
  exports: [VietQRService],
})
export class VietQRModule {}
