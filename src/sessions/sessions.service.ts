import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {RedisService} from 'redis'
import {DB, Db} from 'database'
import {Collection, ObjectId} from 'mongodb'
import {Session} from './session.model'

@Injectable()
export class SessionsService {
  private readonly collectionName = 'sessions'
  private readonly collection: Collection<Session>
  private readonly logger = new Logger(SessionsService.name)

  constructor(
    @Inject(DB) db: Db,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {
    this.collection = db.collection(this.collectionName)
  }

  async getUserSessions(): Promise<Session[]> {
    return this.collection.find().toArray()
  }

  async createSession(userId: ObjectId, sessionId: string): Promise<Session> {
    const session = new Session(userId, sessionId)
    const inserted = await this.collection.insertOne(session)
    if (!inserted.acknowledged) {
      this.logger.error('Insert new session failed')
      throw new InternalServerErrorException()
    }

    return session
  }

  async logoutSession(sessionId: string): Promise<boolean> {
    const result = await this.collection.findOneAndUpdate(
      {sessionId},
      {$set: {active: false, logoutAt: new Date(), updatedAt: new Date()}}
    )
    return !!result.ok
  }

  async revokeSession(_id: ObjectId): Promise<boolean> {
    const result = await this.collection.findOneAndUpdate(
      {_id},
      {$set: {active: false, updatedAt: new Date()}}
    )
    if (!result.ok) {
      this.logger.error({err: result.lastErrorObject}, 'Update session failed')
      return false
    }

    const prefix = this.configService.get('SESSION_PREFIX')
    const sessionId = result.value.sessionId
    await this.redisService.del(`${prefix}${sessionId}`)
    this.logger.log(`Revoke sessionId ${sessionId} successfully`)

    return true
  }
}
