import {BaseModel} from 'shared/models'

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
}

export class User extends BaseModel {
  steamId: string
  role: UserRole
  locked: boolean

  constructor({steamId}: Pick<User, 'steamId'>) {
    super()
    this.steamId = steamId
    this.role = UserRole.USER
    this.locked = false
  }
}
