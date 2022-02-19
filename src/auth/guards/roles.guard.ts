import {Injectable, CanActivate, ExecutionContext, Logger} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {Request} from 'express'
import {UserRole} from 'users'

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name)

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler())

    if (!roles || roles.length <= 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const user = request.session.user
    const matches = roles.includes(user.role)
    if (!matches) {
      this.logger.warn(
        `User{_id: ${user._id}, role: ${
          user.role
        }} try to access resource for roles [${roles.toString()}]`
      )
    }

    return matches
  }
}
