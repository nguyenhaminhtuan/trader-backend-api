import {Inject, Injectable, Logger} from '@nestjs/common'
import {DB, Db} from 'database'
import {Collection} from 'mongodb'
import {User} from 'users'

@Injectable()
export class MeService {
  private readonly collectionName = 'users'
  private readonly collection: Collection<User>
  private readonly logger = new Logger(MeService.name)

  constructor(@Inject(DB) db: Db) {
    this.collection = db.collection(this.collectionName)
  }
}
