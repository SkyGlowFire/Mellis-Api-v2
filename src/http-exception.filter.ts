import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    let message: string | string[] = exception.message
    const errResponse = exception.getResponse() as {message: string[] | string}
    console.log(exception)
    if(status === 403){
      message = errResponse.message || 'You are not authorized.'
    }
    if(status === 400){
      message = errResponse.message
    }
    response
      .status(status)
      .json({
        status,
        message
      });
  }
}