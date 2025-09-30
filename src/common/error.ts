import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { IResponse } from './types';

@Catch()
export class AllExceptions implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctxType = host.getType();
    console.log(
      'ppppppppppppppppp:',

      exception,
      ctxType,
      // exception,
    );

    let status =
      exception?.statusCode ||
      exception?.error?.statusCode ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception?.message || 'Internal server error';

    // Handle Prisma known errors

    // Nest HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    // RpcException from @nestjs/microservices
    else if (exception instanceof RpcException) {
      const rpcError = exception.getError() as any;
      console.log(rpcError);
      status = rpcError.statusCode || status;
      message = rpcError.message || message;
    }

    // if (exception instanceof BadRequestException) {
    //   message = exception?.response?.message || exception.message;
    //   console.log('------------------------------', message);
    // }

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any)?.message || exception.message;

      console.log('------------------------------', message);
    }

    if (ctxType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      const errorResponse = new IResponse(false, message, null);

      response.status(status).json(errorResponse);
    }

    if (ctxType === 'rpc') {
      // Wrap Prisma or other errors into RpcException if not already
      if (!(exception instanceof RpcException)) {
        throw new RpcException({ statusCode: status, message });
      }
      throw exception;
    }
  }
}
