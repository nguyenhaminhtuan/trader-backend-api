import {TransportTargetOptions} from 'pino'

export const prettyTransport: TransportTargetOptions = {
  target: 'pino-pretty',
  level: 'debug',
  options: {
    colorize: true,
    translateTime: true,
    singleLine: true,
  },
}
