import {Injectable, CanActivate, ExecutionContext, Logger} from '@nestjs/common'
import {ConfigService, EnvironmentVariables} from 'config'
import {Request} from 'express'

@Injectable()
export class SecureTokenGuard implements CanActivate {
  private readonly logger = new Logger(SecureTokenGuard.name)

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>()
    const secureToken = req.headers['secure-token']

    if (
      !secureToken ||
      secureToken !== this.configService.get('CASSO_API_SECRET')
    ) {
      this.logger.error(`Invalid secure token ${secureToken}`)
      return false
    }

    return true
  }
}
