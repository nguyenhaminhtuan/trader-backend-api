import {HttpException, HttpStatus} from '@nestjs/common'

export class TooManyRequestException extends HttpException {
  constructor(
    objectOrError?: string | object | any,
    description = 'Too Many Requests'
  ) {
    super(
      HttpException.createBody(objectOrError, description),
      HttpStatus.TOO_MANY_REQUESTS
    )
  }
}
