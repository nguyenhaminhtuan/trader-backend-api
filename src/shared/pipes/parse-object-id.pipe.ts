import {PipeTransform, Injectable, BadRequestException} from '@nestjs/common'
import {ObjectId} from 'mongodb'

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, ObjectId> {
  transform(value: string): ObjectId {
    try {
      const objectId = new ObjectId(value)
      return objectId
    } catch (error) {
      throw new BadRequestException(`${value} is not a valid ObjectId`)
    }
  }
}
