import {applyDecorators, UseGuards} from '@nestjs/common'
import {AuthGuard, RolesGuard} from 'auth/guards'
import {UserRole} from 'users'

export function Auth(...roles: UserRole[]) {
  return applyDecorators(UseGuards(AuthGuard, new RolesGuard(roles)))
}
