import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {Auth, Roles} from 'shared/decorators'
import {Paginate} from 'shared/dto'
import {ParseObjectIdPipe, ParsePositiveIntPipe} from 'shared/pipes'
import {UserRole} from 'users'
import {FilterLogDto} from './dto/filter-log.dto'
import {SortLogDto} from './dto/sort-log.dto'
import {Log} from './log.model'
import {LogsService} from './logs.service'

@Controller('logs')
@Auth(UserRole.DEVELOPER, UserRole.ADMIN)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  getPaginateFilteredLogs(
    @Query('page', new DefaultValuePipe(1), ParsePositiveIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParsePositiveIntPipe)
    pageSize: number,
    @Query('filter', new DefaultValuePipe({})) filter: FilterLogDto,
    @Query('sort', new DefaultValuePipe({})) sort: SortLogDto,
    @Query('q') q?: string
  ): Promise<Paginate<Log[]>> {
    return this.logsService.getPaginateFilteredLogs(
      page,
      pageSize,
      filter,
      sort,
      q
    )
  }

  @Get(':id')
  getLogById(@Param('id', ParseObjectIdPipe) _id: ObjectId): Promise<Log> {
    return this.logsService.getLogById(_id)
  }

  @Delete()
  @Roles(UserRole.DEVELOPER)
  removeAllLogs(): Promise<boolean> {
    return this.logsService.removeAllLogs()
  }
}
