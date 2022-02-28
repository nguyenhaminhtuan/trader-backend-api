import {ObjectId} from 'mongodb'

export class BaseModel {
  _id: ObjectId
  createdAt: Date
  updatedAt: Date

  constructor(_id?: ObjectId) {
    this._id = _id ? _id : new ObjectId()
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}
