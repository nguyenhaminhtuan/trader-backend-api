import {User} from 'users'

declare module 'express-session' {
  interface SessionData {
    authenticated: boolean
    user: User
    loginAt: Date
    logoutAt: Date | null
  }
}
