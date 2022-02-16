import {ObjectId} from 'mongodb'
import {BaseModel} from 'shared/models'

export class Session extends BaseModel {
  userId: ObjectId
  sessionId: string
  active: boolean
  loginAt: Date
  logoutAt: Date | null

  constructor(userId: ObjectId, sessionId: string) {
    super()
    this.userId = userId
    this.sessionId = sessionId
    this.active = true
    this.loginAt = new Date()
    this.logoutAt = null
  }
}
