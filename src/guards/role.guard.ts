import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Roles } from '../decorator/roles.decorator';
import { UserDto } from '../users/dto/user.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const payload: { user: UserDto } = request.user as { user: UserDto };
    if (this.matchRole(roles, payload.user.role)) {
      return true;
    }
    throw new UnauthorizedException();
  }

  private matchRole(roles: string[], userRoles: string): boolean {
    return roles.includes(userRoles);
  }
}
