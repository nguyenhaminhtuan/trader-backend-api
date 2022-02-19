import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import {Collection, Db, ObjectId} from 'mongodb'
import {DB} from 'database'
import {User} from './user.model'

@Injectable()
export class UsersService {
  private readonly collectionName = 'users'
  private readonly collection: Collection<User>
  private readonly logger = new Logger(UsersService.name)

  constructor(@Inject(DB) db: Db) {
    this.collection = db.collection(this.collectionName)
  }

  async findOrCreateUser(steamId: string): Promise<User> {
    this.logger.debug(`Creating user with Steam ID ${steamId}`)
    const existedUser = await this.collection.findOne({steamId})

    if (existedUser) {
      return existedUser
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

  getUsers(): Promise<User[]> {
    return this.collection.find().toArray()
  }
}
