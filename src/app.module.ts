import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {LoggerModule} from 'logger'
import {DatabaseModule} from 'database'
import {HealthModule} from 'health'
import {GracefulModule} from 'graceful'
import {AuthModule} from 'auth'
import {SteamModule} from 'steam'

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    HealthModule,
    GracefulModule,
    AuthModule,
    SteamModule,
  ],
})
export class AppModule {}
