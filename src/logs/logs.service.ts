import {Inject, Injectable, Logger} from '@nestjs/common'
import {DB} from 'database'
import {Collection, Db, Filter, ObjectId} from 'mongodb'
import {Paginate} from 'shared/dto'
import {FilterLogDto, SortLogDto} from './dto'
import {Log} from './log.model'

@Injectable()
export class LogsService {
  private readonly collectionName = 'logs'
  private readonly collection: Collection<Log>
  private readonly logger = new Logger(LogsService.name)

  constructor(@Inject(DB) db: Db) {
    this.collection = db.collection(this.collectionName)
  }

  async getLogs(): Promise<Log[]> {
    return this.collection.find().toArray()
  }

  async getPaginateFilteredLogs(
    page: number,
    pageSize: number,
    filter: FilterLogDto,
    sort: SortLogDto,
    q?: string
  ): Promise<Paginate<Log[]>> {
    const count = await this.collection.countDocuments()
    const totalPage = Math.ceil(count / page)

    const query: Filter<Log> = {}

    if (filter.level) query.level = filter.level
    if (q) query['$text'] = {$search: q, $caseSensitive: true, $language: 'en'}

    const cursor = this.collection.find(query)

    if (sort.time) cursor.sort(['time', sort.time])
    if (sort.level) cursor.sort(['level', sort.level])

    const data = await cursor
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .toArray()
    return new Paginate({
      count,
      data,
      page: {current: page, size: pageSize, total: totalPage},
    })
  }

  async getLogById(_id: ObjectId): Promise<Log> {
    return this.collection.findOne({_id})
  }

  async removeAllLogs(): Promise<boolean> {
    const result = await this.collection.deleteMany({})
    return result.acknowledged
  }
}
