import {INestApplication, Inject, Injectable, Logger} from '@nestjs/common'
import {RedisService} from 'redis'
import {DB_CLIENT} from 'database'
import {MongoClient} from 'mongodb'
import closeWithGrace, {Signals} from 'close-with-grace'

@Injectable()
export class GracefulService {
  private readonly logger = new Logger(GracefulService.name)

  constructor(
    @Inject(DB_CLIENT) private readonly dbClient: MongoClient,
    private readonly redisService: RedisService
  ) {}

  async use(app: INestApplication, opts: {delay: number}) {
    closeWithGrace(
      {delay: opts.delay},
      async (opts: {err?: Error; signal?: Signals; manual?: boolean}) => {
        if (opts.err) {
          this.logger.error({err: opts.err})
        }

        if (opts.signal) {
          this.logger.log(`${opts.signal} received`)
        }

        this.logger.log('Start shutdown application gracefully')

        this.redisService.disconnect(false)
        this.logger.log('Redis disconnected')

        await this.dbClient.close()
        this.logger.log('Database connection closed')

        await app.close()
        this.logger.log('Application closed')
      }
    )
  }
}
