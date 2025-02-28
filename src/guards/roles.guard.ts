import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
//import { Observable } from 'rxjs';
import { ProfileService } from 'src/modules/profile/profile.service';
//import { Role } from 'src/utils/roles.enum';
//import { Role } from 'src/utils/roles.enum';
//import { Role } from 'src/emuns/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly profileService: ProfileService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    /*const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);*/
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // No se requieren roles, acceso permitido.
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('user');
    console.log(user);
    console.log('user.roles');
    console.log(user.roles);

    if (!user || !user.roles) {
      throw new ForbiddenException('No profile associated with this user');
    }

    //console.log('user.profile.name');
    //console.log(user.profile.name);

    const userProfile = await this.profileService.getProfileById(user.roles);

    console.log('userprofile:');
    console.log(userProfile);
    if (!userProfile) {
      throw new ForbiddenException('User profile not found');
    }

    // const hasRole = () => requiredRoles.some((role) => user?.roles?.includes(role));

    const hasRole = requiredRoles.includes(userProfile.name);
    console.log('hasRole:');
    console.log(hasRole);

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this route',
      );
    }

    return true;
  }
}

/*
    const valid = user && user.roles && hasRole;
    if (!valid) {
      throw new ForbiddenException(
        'You dont have permission and nor allowed to access this route',
      );
    }
    return valid;*/
