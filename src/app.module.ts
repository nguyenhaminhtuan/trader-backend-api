import {Module} from '@nestjs/common'
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
  ],
  providers: [SessionConfig],
})
export class AppModule {}
