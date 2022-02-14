import {Module} from '@nestjs/common'
import {ConfigModule} from 'config'
import {dbClientProvider, dbProvider, DB_CLIENT, DB} from './database.providers'

@Module({
  imports: [ConfigModule],
  providers: [dbClientProvider, dbProvider],
  exports: [DB_CLIENT, DB],
})
export class DatabaseModule {}
