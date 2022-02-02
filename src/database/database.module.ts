import {Inject, Module, OnApplicationShutdown} from '@nestjs/common'
import {ConfigModule} from 'config'
import {DbClient, dbClientProvider, DB_CLIENT} from './database.providers'

@Module({
  imports: [ConfigModule],
  providers: [dbClientProvider],
  exports: [DB_CLIENT],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DB_CLIENT) private readonly client: DbClient) {}

  async onApplicationShutdown() {
    await this.client.close()
  }
}
