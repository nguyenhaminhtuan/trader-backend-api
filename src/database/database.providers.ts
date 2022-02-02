import {Logger, Provider} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {DatabaseModule} from './database.module'
import {MongoClient, Db as MongoDb} from 'mongodb'

export const DB_CLIENT = 'DB_CLIENT'
export const DB = 'DB'

export type DbClient = MongoClient
export type Db = MongoDb

export const dbClientProvider: Provider = {
  provide: DB_CLIENT,
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService<EnvironmentVariables>
  ): Promise<DbClient> => {
    const logger = new Logger(DatabaseModule.name)
    const client = new MongoClient(configService.get('DB_URI'), {
      auth: {
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
      },
    })
    await client.connect()
    await client.db('admin').command({ping: 1})
    logger.log('Database successfully connected')
    return client
  },
}

export const dbProvider: Provider = {
  provide: DB,
  inject: [ConfigService, DB_CLIENT],
  useFactory: async (
    configService: ConfigService<EnvironmentVariables>,
    dbClient: DbClient
  ) => dbClient.db(configService.get('DB_NAME')),
}
