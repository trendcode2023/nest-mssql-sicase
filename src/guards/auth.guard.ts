import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AuthService } from 'src/modules/Auth/auth.service';
import { LogoutService } from 'src/modules/auth/logout.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logoutService: LogoutService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1] ?? '';
    console.log({ token });

    if (this.logoutService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token inválido (lista negra)');
    }

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }
    console.log('paso la validacion de token');
    try {
      const secret = process.env.JWT_SECRET;
      const payload = this.jwtService.verify(token, { secret });
      payload.iat = new Date(payload.iat * 1000).toLocaleString();
      payload.exp = new Date(payload.exp * 1000).toLocaleString();
      request.user = payload;
      return true;
    } catch (e) {
      console.log('genero un error');
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }
}

/*
      if (payload.isAdmin) {
        payload.roles = ['admin'];
      } else {
        payload.roles = ['user'];
      }
      */
