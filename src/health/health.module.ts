import {Module} from '@nestjs/common'
import {TerminusModule} from '@nestjs/terminus'
import {ConfigModule} from 'config'
import {DatabaseModule} from 'database'
import {HealthController} from './health.controller'
import {MongoIndicator} from './indicators'

@Module({
  imports: [TerminusModule, ConfigModule, DatabaseModule],
  controllers: [HealthController],
  providers: [MongoIndicator],
})
export class HealthModule {}
