import {Inject, Module, OnApplicationShutdown} from '@nestjs/common'
import {ConfigModule} from 'config'
import {
  DbClient,
  dbClientProvider,
  dbProvider,
  DB_CLIENT,
  DB,
} from './database.providers'

@Module({
  imports: [ConfigModule],
  providers: [dbClientProvider, dbProvider],
  exports: [DB_CLIENT, DB],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DB_CLIENT) private readonly client: DbClient) {}

  async onApplicationShutdown() {
    await this.client.close()
  }
}
