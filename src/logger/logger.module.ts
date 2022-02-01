import {DynamicModule, Module} from '@nestjs/common'
import {
  ConfigModule,
  ConfigService,
  EnvironmentVariables,
  Environment,
} from 'config'
import {Logger} from './logger'
import {LoggerModuleAsyncOptions} from './logger.interface'
import {prettyTransport} from './logger.transports'

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        const isProd = configService.get('NODE_ENV') === Environment.Production
        return {
          level: !isProd ? 'debug' : 'info',
          transport: !isProd && prettyTransport,
        }
      },
    }),
  ],
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {
  static forRootAsync({
    imports,
    inject,
    useFactory,
  }: LoggerModuleAsyncOptions): DynamicModule {
    const optionsProvider = {
      provide: 'LOGGER_OPTIONS',
      useFactory,
      inject,
    }

    return {
      module: LoggerModule,
      imports,
      providers: [optionsProvider],
      exports: [Logger, optionsProvider],
    }
  }
}
