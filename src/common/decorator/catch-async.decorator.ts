import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { getPrismaErrorMessage } from '../prismaError'; // your helper

@Injectable()
export class CatchRpcErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          const message = getPrismaErrorMessage(error);
          const status = HttpStatus.BAD_REQUEST;
          return throwError(
            () => new RpcException({ statusCode: status, message }),
          );
        }

        return throwError(() => new RpcException(error));
      }),
    );
  }
}
