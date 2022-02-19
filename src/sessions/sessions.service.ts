import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {RedisService} from 'redis'
import {DB} from 'database'
import {Collection, Db, ObjectId} from 'mongodb'
import {Session} from './session.model'
import {SessionData, Session as ExpressSession} from 'express-session'

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

  async createSession(
    userId: ObjectId,
    {id, cookie: {expires}}: ExpressSession & Partial<SessionData>
  ): Promise<Session> {
    const session = new Session(userId, id, expires)
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
      {$set: {logoutAt: new Date(), updatedAt: new Date()}}
    )
    return !!result.ok
  }

  async revokeSession(_id: ObjectId): Promise<boolean> {
    const result = await this.collection.findOneAndUpdate(
      {_id},
      {$set: {updatedAt: new Date()}}
    )

    if (!result.ok) {
      this.logger.error({err: result.lastErrorObject}, 'Update session failed')
    }

    const prefix = this.configService.get('SESSION_PREFIX')
    const sessionId = result.value.sessionId
    await this.redisService.del(`${prefix}${sessionId}`)

    return !!result.ok
  }
}
