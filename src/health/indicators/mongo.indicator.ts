import {Inject, Injectable} from '@nestjs/common'
import {HealthCheckError, HealthIndicator} from '@nestjs/terminus'
import {DB_CLIENT} from 'database'
import {MongoClient} from 'mongodb'

@Injectable()
export class MongoIndicator extends HealthIndicator {
  constructor(@Inject(DB_CLIENT) private readonly dbClient: MongoClient) {
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
