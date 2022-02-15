import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {LoggerModule} from 'logger'
import {DatabaseModule} from 'database'
import {SessionModule} from 'session'
import {CacheModule} from 'cache'
import {HealthModule} from 'health'
import {GracefulModule} from 'graceful'
import {AuthModule} from 'auth'
import {SteamModule} from 'steam'
import {EtopModule} from 'etop'
import {UsersModule} from 'users'
import {MeModule} from 'me'

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    SessionModule,
    CacheModule,
    HealthModule,
    GracefulModule,
    AuthModule,
    SteamModule,
    EtopModule,
    UsersModule,
    MeModule,
  ],
})
export class AppModule {}
