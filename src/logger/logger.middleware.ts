import pinoHttp from 'pino-http'
import {Request, Response, NextFunction} from 'express'
import {v4 as uuidV4} from 'uuid'
import {ConfigService, Environment, EnvironmentVariables} from 'config'
import {mongodbTransport, prettyTransport} from './transports'

const configService = new ConfigService<EnvironmentVariables>()
const isProd = configService.get('NODE_ENV') === Environment.Production

const logger = pinoHttp({
  autoLogging: {
    ignorePaths: ['/api/health'],
  },
  genReqId: (req) => (!isProd ? req.id : uuidV4()),
  customLogLevel: (res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error'
    } else if (res.statusCode >= 400) {
      return 'warn'
    } else {
      return 'info'
    }
  },
  customSuccessMessage: () => 'Request completed',
  customErrorMessage: () => 'Request error',
  reqCustomProps: (req: any) => ({
    context: 'LoggerMiddleware',
    sessionID: req.sessionID,
  }),
  transport: !isProd ? prettyTransport : mongodbTransport(configService),
})

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger(req, res)
  next()
}
