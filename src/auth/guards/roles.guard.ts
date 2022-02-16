import {Injectable, CanActivate, ExecutionContext, Logger} from '@nestjs/common'
import {Request} from 'express'
import {UserRole} from 'users'

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name)

  constructor(private readonly roles: UserRole[]) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.roles || this.roles.length <= 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const user = request.session.user
    const matches = this.roles.includes(user.role)
    if (!matches) {
      this.logger.warn(
        `User{_id: ${user._id}, role: ${
          user.role
        }} try to access resource for roles [${this.roles.toString()}]`
      )
    }

    return matches
  }
}
