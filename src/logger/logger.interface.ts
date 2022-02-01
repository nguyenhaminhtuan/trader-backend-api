import {ModuleMetadata} from '@nestjs/common'
import {LoggerOptions} from 'pino'

export type LoggerModuleOptions = LoggerOptions

export interface LoggerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<LoggerModuleOptions> | LoggerModuleOptions
  inject?: any[]
}
