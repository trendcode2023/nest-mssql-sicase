import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MethodFilterMiddleware implements NestMiddleware {
  private readonly allowedMethods: string[];

  constructor() {
    this.allowedMethods = process.env.ALLOWED_METHODS
      ? process.env.ALLOWED_METHODS.split(',').map((m) =>
          m.trim().toUpperCase(),
        )
      : ['GET', 'POST'];
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.allowedMethods.includes(req.method)) {
      res.setHeader('Allow', this.allowedMethods.join(', '));
      return res.status(405).json({
        statusCode: 405,
        message: 'Method Not Allowed',
      });
    }
    next();
  }
}
