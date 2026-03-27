import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionBody =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = this.resolveMessage(exceptionBody);

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveMessage(body: unknown): string | string[] {
    if (typeof body === 'string') {
      return body;
    }

    if (this.isObjectWithMessage(body)) {
      return body.message;
    }

    return 'Internal server error';
  }

  private isObjectWithMessage(
    value: unknown,
  ): value is { message: string | string[] } {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as { message?: unknown };
    return (
      typeof candidate.message === 'string' || Array.isArray(candidate.message)
    );
  }
}
