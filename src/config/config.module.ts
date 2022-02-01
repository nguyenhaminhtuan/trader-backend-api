import {Module} from '@nestjs/common'
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config'
import {ConfigService} from './config.service'
import {validateEnv} from './env.validation'

@Module({
  imports: [
    NestConfigModule.forRoot({
      cache: true,
      validate: validateEnv,
    }),
  ],
  providers: [ConfigService, NestConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
