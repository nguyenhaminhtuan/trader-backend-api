import {Module} from '@nestjs/common'
import {APP_GUARD} from '@nestjs/core'
import {RateLimitGuard} from 'shared/guards'
import {AuthModule} from 'auth'
import {ConfigModule, SessionConfig} from 'config'
import {DatabaseModule} from 'database'
import {EtopModule} from 'etop'
import {GracefulModule} from 'graceful'
import {HealthModule} from 'health'
import {LoggerModule} from 'logger'
import {MeModule} from 'me'
import {RedisModule} from 'redis'
import {SessionsModule} from 'sessions'
import {SteamModule} from 'steam'
import {UsersModule} from 'users'
import {LogsModule} from 'logs'

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    DatabaseModule,
    EtopModule,
    GracefulModule,
    HealthModule,
    LoggerModule,
    MeModule,
    RedisModule,
    SessionsModule,
    SteamModule,
    UsersModule,
    LogsModule,
  ],
  providers: [SessionConfig, {provide: APP_GUARD, useClass: RateLimitGuard}],
})
export class AppModule {}
