import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../modules/Auth/auth.service';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    console.log('ENTRO 2JwtMiddleware');
    Logger.debug('ENTRO 2JwtMiddleware');
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      // Verificar si el token es válido
      const decoded = this.jwtService.verify(token);

      // Verificar si el token está en la lista negra
      if (this.authService.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token inválido (lista negra)');
      }

      // Adjuntar el usuario decodificado a la solicitud
      req['user'] = decoded;
      next();
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
