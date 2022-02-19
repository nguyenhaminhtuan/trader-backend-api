import {ObjectId} from 'mongodb'
import {BaseModel} from 'shared/models'

export class Session extends BaseModel {
  userId: ObjectId
  sessionId: string
  expires: Date
  loginAt: Date
  logoutAt: Date | null

  constructor(userId: ObjectId, sessionId: string, expires: Date) {
    super()
    this.userId = userId
    this.sessionId = sessionId
    this.expires = expires
    this.loginAt = new Date()
    this.logoutAt = null
  }
}
