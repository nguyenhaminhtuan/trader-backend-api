import {User} from 'users'

declare module 'express-session' {
  interface SessionData {
    user: User
  }
}
