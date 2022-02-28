import {Module} from '@nestjs/common'
import {APP_FILTER, APP_GUARD} from '@nestjs/core'
import {RateLimitGuard} from 'shared/guards'
import {AllExceptionsFilter} from 'shared/filters'
import {AuthModule} from 'auth'
import {ConfigModule, SessionConfig} from 'config'
import {DatabaseModule} from 'database'
import {EtopModule} from 'etop'
import {GracefulModule} from 'graceful'
import {HealthModule} from 'health'
import {LoggerModule} from 'logger'
import {RedisModule} from 'redis'
import {SessionsModule} from 'sessions'
import {SteamModule} from 'steam'
import {UsersModule} from 'users'
import {LogsModule} from 'logs'
import {SettingsModule} from 'settings'

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    DatabaseModule,
    EtopModule,
    GracefulModule,
    HealthModule,
    LoggerModule,
    RedisModule,
    SessionsModule,
    SteamModule,
    UsersModule,
    LogsModule,
    SettingsModule,
  ],
  providers: [
    SessionConfig,
    {provide: APP_GUARD, useClass: RateLimitGuard},
    {provide: APP_FILTER, useClass: AllExceptionsFilter},
  ],
})
export class AppModule {}
