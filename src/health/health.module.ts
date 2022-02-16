import {Module} from '@nestjs/common'
import {TerminusModule} from '@nestjs/terminus'
import {ConfigModule} from 'config'
import {DatabaseModule} from 'database'
import {RedisModule} from 'redis'
import {HealthController} from './health.controller'
import {MongoIndicator, RedisIndicator} from './indicators'

@Module({
  imports: [TerminusModule, ConfigModule, DatabaseModule, RedisModule],
  controllers: [HealthController],
  providers: [MongoIndicator, RedisIndicator],
})
export class HealthModule {}
