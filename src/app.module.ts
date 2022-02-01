import {Module, CacheModule} from '@nestjs/common'
import {ConfigModule} from 'config'
import {LoggerModule} from 'logger'
import {DatabaseModule} from 'database'
import {SessionModule} from 'session'
import {RedisModule, RedisService, RedisStoreFactory} from 'redis'
import {HealthModule} from 'health'
import {GracefulModule} from 'graceful'
import {AuthModule} from 'auth'
import {SteamModule} from 'steam'

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    SessionModule,
    CacheModule.registerAsync({
      imports: [RedisModule],
      inject: [RedisStoreFactory, RedisService],
      useFactory: (redis: RedisStoreFactory, client: RedisService) => ({
        store: redis,
        client,
      }),
    }),
    HealthModule,
    GracefulModule,
    AuthModule,
    SteamModule,
  ],
})
export class AppModule {}
