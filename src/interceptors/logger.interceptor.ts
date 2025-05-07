import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { WinstonLoggerService } from 'src/modules/logger/winston-logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user || {};
    const username = user.name || user.email || user.id || 'Desconocido';

    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const formattedTime = now.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const fullDateTime = `${formattedDate} ${formattedTime}`;

    this.logger.log(
      `Usuario ${username} ejecutó ${req.method} en ${req.url} a las ${fullDateTime}`,
      'LoggerInterceptor',
    );

    return next.handle().pipe(
      tap(() => {
        // Aquí puedes loggear el resultado si lo necesitas
      }),
    );
  }
}
