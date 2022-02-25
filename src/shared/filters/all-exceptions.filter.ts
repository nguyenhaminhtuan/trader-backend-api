import {Catch, ArgumentsHost, HttpException} from '@nestjs/common'
import {BaseExceptionFilter, HttpAdapterHost} from '@nestjs/core'
import {Request, Response} from 'express'
import {ConfigService, Environment, EnvironmentVariables} from 'config'
import {Span, User} from '@sentry/types'
import {
  withScope,
  getCurrentHub,
  NodeClient,
  captureException,
  Severity,
  NodeOptions,
} from '@sentry/node'

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(
    {httpAdapter}: HttpAdapterHost,
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {
    super(httpAdapter)
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>()
    const res = host.switchToHttp().getResponse<Response>()

    if (this.configService.get('NODE_ENV') === Environment.Production) {
      this.sendToSentry(exception, req, res)
    }

    super.catch(exception, host)
  }

  private sendToSentry(exception: unknown, req: Request, res: Response) {
    const user: User = {
      ip_address: req.ip,
    }

    if (req.session.user) user.id = req.session.user._id.toString()

    withScope((_scope) => {
      const transaction = (res as any).__sentry_transaction as Span
      if (transaction && _scope.getSpan() === undefined) {
        _scope.setSpan(transaction)
      }

      const client = getCurrentHub().getClient<NodeClient>()
      if (client && this.isAutoSessionTrackingEnabled(client)) {
        const isSessionAggregatesMode =
          (client as any)._sessionFlusher !== undefined

        if (isSessionAggregatesMode) {
          const requestSession = _scope.getRequestSession()

          if (requestSession && requestSession.status !== undefined) {
            requestSession.status = 'crashed'
          }
        }
      }
    })

    const eventId = captureException(exception, {
      user,
      level:
        exception instanceof HttpException ? Severity.Warning : Severity.Error,
    })
    ;(res as any).sentry = eventId
  }

  private isAutoSessionTrackingEnabled(client?: NodeClient): boolean {
    if (client === undefined) {
      return false
    }
    const clientOptions: NodeOptions = client && client.getOptions()
    if (clientOptions && clientOptions.autoSessionTracking !== undefined) {
      return clientOptions.autoSessionTracking
    }
    return false
  }
}
