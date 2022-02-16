import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {Request} from 'express'
import {User} from 'users'

export const CurrentUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    const user = request.session.user

    return data ? user[data] : user
  }
)
