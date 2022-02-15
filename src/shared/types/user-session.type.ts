import {User} from 'users'

export type UserSession = {
  user: User
}

declare module 'express-session' {
  interface SessionData {
    user: User
  }
}
