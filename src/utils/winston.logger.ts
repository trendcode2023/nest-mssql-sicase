import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export const winstonLogger = createLogger({
  level: 'info',
  //format: format.combine(),
  transports: [
    new transports.Console({
      format: format.combine(
        //format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),

        format.printf(({ level, message, timestamp, context }) => {
          const levelColor =
            {
              info: '\x1b[32m', // verde
              error: '\x1b[31m', // rojo
              warn: '\x1b[33m', // amarillo
              debug: '\x1b[36m', // cyan
              verbose: '\x1b[35m', // magenta
            }[level] || '\x1b[0m';

          const reset = '\x1b[0m';

          const ctx = context ? `[${context}]` : '';
          return `[${timestamp}]${levelColor}  ${level.toUpperCase()} ${reset} ${ctx}: ${message}`;
        }),
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json(), // Guarda los archivos en formato JSON
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '30d',
      level: 'error',
      format: format.combine(
        format.timestamp(),
        format.json(), // Guarda los archivos en formato JSON
      ),
    }),
  ],
});