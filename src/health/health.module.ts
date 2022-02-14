import {Module} from '@nestjs/common'
import {TerminusModule} from '@nestjs/terminus'
import {CacheModule} from 'cache'
import {ConfigModule} from 'config'
import {DatabaseModule} from 'database'
import {HealthController} from './health.controller'
import {MongoIndicator, RedisIndicator} from './indicators'

@Module({
  imports: [TerminusModule, ConfigModule, DatabaseModule, CacheModule],
  controllers: [HealthController],
  providers: [MongoIndicator, RedisIndicator],
})
export class HealthModule {}
