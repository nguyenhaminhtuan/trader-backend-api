import {INestApplication, Inject, Injectable, Logger} from '@nestjs/common'
import {RedisService} from 'redis'
import {DB_CLIENT, DbClient} from 'database'
import closeWithGrace from 'close-with-grace'

@Injectable()
export class GracefulService {
  private readonly logger = new Logger(GracefulService.name)

  constructor(
    @Inject(DB_CLIENT) private readonly dbClient: DbClient,
    private readonly redisService: RedisService
  ) {}

  async use(app: INestApplication, opts: {delay: number}) {
    closeWithGrace({delay: opts.delay}, async ({err, signal}) => {
      if (err) {
        this.logger.error({err})
      }

      if (signal) {
        this.logger.log(`${signal} received`)
      }

      this.logger.log('Start shutdown application gracefully')

      this.redisService.disconnect(false)
      this.logger.log('Redis disconnected')

      await this.dbClient.close()
      this.logger.log('Database connection closed')

      await app.close()
      this.logger.log('Application closed')
    })
  }
}
