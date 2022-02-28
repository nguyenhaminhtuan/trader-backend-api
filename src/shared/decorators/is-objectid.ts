import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator'
import {ObjectId} from 'mongodb'

@ValidatorConstraint({name: 'ObjectId', async: false})
class ObjectIdConstranit implements ValidatorConstraintInterface {
  validate(value: string) {
    return ObjectId.isValid(value)
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be ObjectId`
  }
}

export function IsObjectId(options?: ValidationOptions) {
  return (object: Record<any, any>, propertyName: string) =>
    registerDecorator({
      name: 'isObjectId',
      target: object.constructor,
      propertyName,
      options,
      validator: ObjectIdConstranit,
    })
}
