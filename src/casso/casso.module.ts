import {Module} from '@nestjs/common'
import {HttpModule} from '@nestjs/axios'
import {ConfigModule, ConfigService, EnvironmentVariables} from 'config'
import {DatabaseModule} from 'database'
import {EtopModule} from 'etop'
import {OrdersModule} from 'orders'
import {UsersModule} from 'users'
import {CassoController} from './casso.controller'
import {CassoService} from './casso.service'

@Module({
  imports: [
    ConfigModule,
    OrdersModule,
    DatabaseModule,
    EtopModule,
    UsersModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        baseURL: configService.get('CASSO_API_URL'),
        headers: {
          Authorization: `Apikey ${configService.get('CASSO_API_KEY')}`,
        },
        timeout: 3500,
      }),
    }),
  ],
  controllers: [CassoController],
  providers: [CassoService],
  exports: [CassoService],
})
export class CassoModule {}
