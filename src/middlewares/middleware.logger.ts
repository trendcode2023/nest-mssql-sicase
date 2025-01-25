import { NextFunction, Request, Response } from 'express';

export function LoggerGlobal(req: Request, res: Response, next: NextFunction) {
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
  console.log(
    `Estas ejecutando un metodo ${req.method} en la ruta ${req.url} con fecha ${fullDateTime}`,
  );
  next();
}
