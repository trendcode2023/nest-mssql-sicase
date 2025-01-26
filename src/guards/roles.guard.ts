import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/utils/roles.enum';
//import { Role } from 'src/utils/roles.enum';
//import { Role } from 'src/emuns/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('paso getHandler and getClass');
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user);

    const hasRole = () =>
      requiredRoles.some((role) => user?.roles?.includes(role));

    console.log(user.roles);

    const valid = user && user.roles && hasRole();
    if (!valid) {
      throw new ForbiddenException(
        'You dont have permission and nor allowed to access this route',
      );
    }
    return valid;
  }
}
