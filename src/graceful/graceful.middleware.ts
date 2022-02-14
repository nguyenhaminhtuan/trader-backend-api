import {ServiceUnavailableException} from '@nestjs/common'
import {NextFunction, Request, Response} from 'express'
import closeWithGrace from 'close-with-grace'

export function gracefulMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if ((closeWithGrace as any).closing) {
    res.setHeader('Connection', 'close')
    throw new ServiceUnavailableException()
  }

  next()
}
