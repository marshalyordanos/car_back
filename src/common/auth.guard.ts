import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // check if route is @Public()
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) return true;

    if (context.getType() === 'rpc') {
      const data = context.switchToRpc().getData();
      const token =
        data?.headers?.authorization?.replace('Bearer ', '') || null;
      console.log('Token :', data?.headers?.authorization);

      console.log('-------------: ', token);
      if (!token)
        throw new RpcException({
          statusCode: 401,
          message: 'No token provided',
        });

      try {
        const payload = await this.jwtService.verifyAsync(token);

        data.user = payload; // attach decoded token
      } catch (err) {
        console.log('88888888888888888888888888:', err);
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid token',
        });
      }
      return true;
    }

    return false;
  }
}

// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(private readonly jwtService: JwtService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     // HTTP context (Gateway)
//     if (context.getType() === 'http') {
//       const request = context.switchToHttp().getRequest();
//       const token = this.extractTokenFromHeader(request);

//       if (!token) throw new UnauthorizedException('No token provided');

//       try {
//         const payload = await this.jwtService.verifyAsync(token);
//         request.user = payload; // attach payload
//       } catch {
//         throw new UnauthorizedException('Invalid token');
//       }
//       return true;
//     }

//     // Microservice context
//     if (context.getType() === 'rpc') {
//       const data = context.switchToRpc().getData();
//       const token =
//         data?.headers?.authorization?.replace('Bearer ', '') || null;

//       if (!token) throw new UnauthorizedException('No token provided');

//       try {
//         const payload = await this.jwtService.verifyAsync(token);
//         context.switchToRpc().getData().user = payload;
//       } catch {
//         throw new UnauthorizedException('Invalid token');
//       }
//       return true;
//     }

//     return false;
//   }

//   private extractTokenFromHeader(request: any): string | null {
//     const authHeader = request.headers.authorization;
//     if (!authHeader) return null;
//     const [type, token] = authHeader.split(' ');
//     return type === 'Bearer' ? token : null;
//   }
// }
