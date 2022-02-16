import {Controller} from '@nestjs/common'
import {Auth} from 'shared/decorators'
import {UserRole} from './user.model'

@Controller('/users')
@Auth(UserRole.ADMIN, UserRole.DEVELOPER)
export class UsersController {}
