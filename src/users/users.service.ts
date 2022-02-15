import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {Collection, ObjectId} from 'mongodb'
import {DB, Db} from 'database'
import {User} from './user.model'

@Injectable()
export class UsersService {
  private readonly collectionName = 'users'
  private readonly collection: Collection<User>
  private readonly logger = new Logger(UsersService.name)

  constructor(@Inject(DB) db: Db) {
    this.collection = db.collection(this.collectionName)
  }

  async createUser(steamId: string): Promise<User> {
    this.logger.debug(`Creating user with Steam ID ${steamId}`)
    if (await this.collection.findOne({steamId})) {
      this.logger.warn(`Steam ID ${steamId} not found`)
      throw new ConflictException('User already existed')
    }

    const user = new User({steamId})
    const insertResult = await this.collection.insertOne(user)
    this.logger.debug({insertResult})
    if (!insertResult.acknowledged) {
      this.logger.error(`Cannot insert user with Steam ID ${steamId}`)
      throw new InternalServerErrorException()
    }

    return user
  }

  getUserById(_id: ObjectId): Promise<User> {
    return this.collection.findOne({_id})
  }
}
