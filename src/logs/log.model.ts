import {ObjectId} from 'mongodb'

export class Log {
  _id: ObjectId
  level: number
  time: number
  msg: string
  pid: number
  hostname: number
  err?: any
}
