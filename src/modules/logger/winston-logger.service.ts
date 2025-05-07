import { Injectable, LoggerService } from '@nestjs/common';
import { winstonLogger } from 'src/utils/winston.logger';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private readonly logger = winstonLogger;

  log(message: string, context?: string) {
    this.logger.info(message, { context });
    //this.logger.info(message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(`${message} ${trace || ''}`, { context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
