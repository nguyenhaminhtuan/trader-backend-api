import {Inject, Injectable} from '@nestjs/common'
import {HealthCheckError, HealthIndicator} from '@nestjs/terminus'
import {DbClient, DB_CLIENT} from 'database'

@Injectable()
export class MongoIndicator extends HealthIndicator {
  constructor(@Inject(DB_CLIENT) private readonly dbClient: DbClient) {
    super()
  }

  async isHealthy(key: string) {
    try {
      await this.dbClient.db('admin').command({ping: 1})
      return this.getStatus(key, true)
    } catch (error) {
      throw new HealthCheckError('Mongocheck failed', error)
    }
  }
}
