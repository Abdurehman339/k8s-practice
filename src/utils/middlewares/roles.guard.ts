import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { AppConfig } from 'src/config';
import { TRequest } from 'utils/interfaces/t-request';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      AppConfig.user.roles_key,
      context.getHandler(),
    );

    if (!requiredRoles) {
      // No roles are specified for this route, so access is granted
      return true;
    }

    const request: TRequest = context.switchToHttp().getRequest();
    const user: Partial<User> = request.user; // Assuming user data is available after authentication

    // if (!user || !user.role) {
    if (!user) {
      throw new ForbiddenException('Invalid role');
    }

    // Check if the user has at least one of the required roles
    // const hasRequiredRole: boolean = requiredRoles.some((role) =>
    //   user.role.includes(role),
    // );

    // if (!hasRequiredRole) {
    //   throw new ForbiddenException(`Forbidden resource for ${user.role}`);
    // }

    return true;
  }
}
