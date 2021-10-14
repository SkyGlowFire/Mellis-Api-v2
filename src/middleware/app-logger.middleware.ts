import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, body } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;

      this.logger.log(
        `${method} '${originalUrl}', status: ${statusCode} - ${userAgent} ${ip}`
      );
      if(['PATCH', 'POST', 'PUT'].includes(method)){
        this.logger.log('body: ', body)
      }
    });

    next();
  }
}