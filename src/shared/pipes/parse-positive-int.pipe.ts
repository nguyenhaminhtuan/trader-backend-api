import {PipeTransform, Injectable, BadRequestException} from '@nestjs/common'
import {isPositive} from 'class-validator'

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform {
  transform(value: string) {
    try {
      const number = parseInt(value, 10)

      if (!isPositive(number)) {
        throw new Error()
      }

      return number
    } catch (error) {
      throw new BadRequestException(`${value} is not a positive number`)
    }
  }
}
