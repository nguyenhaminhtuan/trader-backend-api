import {Module} from '@nestjs/common'
import {HttpModule} from '@nestjs/axios'
import {ConfigModule, ConfigService, EnvironmentVariables} from 'config'
import {RedisModule} from 'redis'
import {EtopService} from './etop.service'
import {EtopControler} from './etop.controller'

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        baseURL: configService.get('ETOP_API_URL'),
        timeout: 7000,
        withCredentials: true,
      }),
    }),
  ],
  providers: [EtopService],
  controllers: [EtopControler],
  exports: [EtopService],
})
export class EtopModule {}
