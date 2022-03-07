import {Injectable} from '@nestjs/common'
import {Request} from 'express'
import session, {SessionOptions} from 'express-session'
import connectMongoDB from 'connect-mongodb-session'
import {ConfigService, Environment, EnvironmentVariables} from './'

const MongoDBStore = connectMongoDB(session)

@Injectable()
export class SessionConfig implements SessionOptions {
  secret: string | string[]
  genid: (req: Request) => string
  name?: string
  store?: session.Store
  cookie?: session.CookieOptions
  rolling?: boolean
  resave?: boolean
  proxy?: boolean
  saveUninitialized?: boolean
  unset?: 'destroy' | 'keep'

  constructor(configService: ConfigService<EnvironmentVariables>) {
    this.store = new MongoDBStore({
      uri: configService.get('DB_URI'),
      collection: 'sessions',
    })
    this.secret = configService.get('SESSION_COOKIE_SECRET')
    this.resave = false
    this.saveUninitialized = false
    this.name = 'sid'
    this.cookie = {
      path: '/',
      sameSite: true,
      httpOnly: true,
      secure: configService.get('NODE_ENV') === Environment.Production,
      maxAge: 1000 * 60 * 60 * 24, // 1 day,
    }
  }
}
