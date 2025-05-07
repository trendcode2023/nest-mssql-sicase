import { NextFunction, Request, Response } from 'express';
import { WinstonLoggerService } from 'src/modules/logger/winston-logger.service';

export function LoggerGlobal(req: Request, res: Response, next: NextFunction) {
  const logger = new WinstonLoggerService();
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
  logger.log(
    `Estas ejecutando un metodo ${req.method} en la ruta ${req.url} con fecha ${fullDateTime}`,
  );
  next();
}
