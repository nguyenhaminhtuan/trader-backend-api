import {ArgumentsHost, Catch} from '@nestjs/common'
import {BaseExceptionFilter} from '@nestjs/core'
import {Response} from 'express'
import {ThrottlerException} from '@nestjs/throttler'

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter extends BaseExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>()

    return res.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      error: 'Too many requests',
      message: 'Too many requests, please retry later',
    })
  }
}
