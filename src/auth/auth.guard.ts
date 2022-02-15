import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'
import {Request} from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name)

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>()

    if (!request.session.user) {
      throw new UnauthorizedException('Authentication required')
    }

    const user = request.session.user
    if (user.locked) {
      this.logger.warn(`User{_id: ${user._id}} try to access while blocked`)
      return false
    }

    return true
  }
}
