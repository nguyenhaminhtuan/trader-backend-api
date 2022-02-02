import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService, EnvironmentVariables} from 'config'
import {CacheModule} from 'cache'
import {HttpModule} from '@nestjs/axios'
import {EtopService} from './etop.service'
import {EtopControler} from './etop.controller'

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        baseURL: configService.get('ETOP_API_URL'),
        timeout: 2500,
      }),
    }),
  ],
  providers: [EtopService],
  controllers: [EtopControler],
  exports: [EtopService],
})
export class EtopModule {}
