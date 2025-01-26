import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1] ?? '';
    console.log({ token });
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }
    console.log('paso la validacion de token');
    try {
      const secret = process.env.JWT_SECRET;
      const payload = this.jwtService.verify(token, { secret });
      payload.iat = new Date(payload.iat * 1000);
      payload.exp = new Date(payload.exp * 1000);

      /*
      if (payload.isAdmin) {
        payload.roles = ['admin'];
      } else {
        payload.roles = ['user'];
      }
      */
      request.user = payload;
      return true;
    } catch (e) {
      console.log('genero un error');
      throw new UnauthorizedException('Invalid token');
    }
  }
}
