import {Controller, Delete, Get, Param} from '@nestjs/common'
import {ObjectId} from 'mongodb'
import {Auth} from 'shared/decorators'
import {ParseObjectIdPipe} from 'shared/pipes'
import {UserRole} from 'users'
import {Session} from './session.model'
import {SessionsService} from './sessions.service'

@Controller('sessions')
@Auth(UserRole.ADMIN, UserRole.DEVELOPER)
export class SessionsController {
  constructor(private readonly sessionService: SessionsService) {}

  @Get()
  getUserSessions(): Promise<Session[]> {
    return this.sessionService.getUserSessions()
  }

  @Delete('/:id')
  revokeSession(
    @Param('id', ParseObjectIdPipe) id: ObjectId
  ): Promise<boolean> {
    return this.sessionService.revokeSession(id)
  }
}
