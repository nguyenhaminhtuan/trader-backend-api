import {Module} from '@nestjs/common'
import {APP_FILTER, APP_GUARD} from '@nestjs/core'
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler'
import {ScheduleModule} from '@nestjs/schedule'
import {AllExceptionsFilter} from 'shared/filters'
import {AuthModule} from 'auth'
import {ConfigModule, SessionConfig} from 'config'
import {DatabaseModule} from 'database'
import {EtopModule} from 'etop'
import {GracefulModule} from 'graceful'
import {HealthModule} from 'health'
import {LoggerModule} from 'logger'
import {SteamModule} from 'steam'
import {UsersModule} from 'users'
import {SettingsModule} from 'settings'
import {OrdersModule} from 'orders'
import {CassoModule} from 'casso'
import {GiftsModule} from 'gifts'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 30, // 30 seconds
      limit: 10,
    }),
    AuthModule,
    ConfigModule,
    DatabaseModule,
    EtopModule,
    GracefulModule,
    HealthModule,
    LoggerModule,
    SteamModule,
    UsersModule,
    SettingsModule,
    OrdersModule,
    CassoModule,
    GiftsModule,
  ],
  providers: [
    SessionConfig,
    {provide: APP_GUARD, useClass: ThrottlerGuard},
    {provide: APP_FILTER, useClass: AllExceptionsFilter},
  ],
})
export class AppModule {}
