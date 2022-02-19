import {applyDecorators, SetMetadata, UseGuards} from '@nestjs/common'
import {RolesGuard} from 'auth/guards'
import {UserRole} from 'users'

export function Roles(...roles: UserRole[]) {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(RolesGuard))
}
