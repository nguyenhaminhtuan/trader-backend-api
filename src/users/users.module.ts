import {Module} from '@nestjs/common'
import {DatabaseModule} from 'database'
import {UsersController} from './users.controller'
import {UsersService} from './users.service'

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
