import {Module} from '@nestjs/common'
import {ConfigModule as NestConfigModule} from '@nestjs/config'
import {ConfigService} from './config.service'
import {validateEnv} from './env.validation'

@Module({
  imports: [
    NestConfigModule.forRoot({
      cache: true,
      validate: validateEnv,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
