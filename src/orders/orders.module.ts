import {HttpModule} from '@nestjs/axios'
import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService, EnvironmentVariables} from 'config'
import {DatabaseModule} from 'database'
import {EtopModule} from 'etop'
import {RedisModule} from 'redis'
import {SettingsModule} from 'settings'
import {OrdersController} from './orders.controller'
import {OrdersService} from './orders.service'

@Module({
  imports: [
    DatabaseModule,
    SettingsModule,
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
    ConfigModule,
    EtopModule,
    RedisModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
